import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  signUp: async (email: string, password: string) => {
    const isAdmin = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com'].includes(email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })

    if (error) throw error

    if (data.user) {
      // Create initial profile
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        role: isAdmin ? 'admin' : 'tutor', // admin role for admin users
      })
    }
  },

  signIn: async (email: string, password: string) => {
    const isAdmin = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com'].includes(email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // If it's an admin user and the error is about email confirmation, allow them to proceed
      if (isAdmin && error.message.includes('Email not confirmed')) {
        // Try to get the user session even if not confirmed
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          set({ user: sessionData.session.user, session: sessionData.session })
          await get().loadProfile()
          return
        }
      }
      throw error
    }

    set({ user: data.user, session: data.session })
    await get().loadProfile()
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, session: null, profile: null })
  },

  loadProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If profile doesn't exist, create a default one
    if (error && error.code === 'PGRST116') {
      const isAdmin = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com'].includes(user.email || '')
      const defaultProfile = {
        user_id: user.id,
        role: isAdmin ? 'admin' : 'tutor',
        full_name: '',
        phone: '',
        city: '',
        locality: '',
        lat: null,
        lon: null
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating profile:', insertError)
        set({ profile: null })
        return
      }

      set({ profile: newProfile })
      return
    }

    if (error) throw error
    set({ profile: data })
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user } = get()
    if (!user) throw new Error('User not authenticated')

    // First try to update the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    // If the profile doesn't exist, create it
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single()

      if (insertError) throw insertError
      set({ profile: newProfile })
      return
    }

    if (error) throw error
    set({ profile: data })
  },
}))

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ session, user: session?.user || null, loading: false })
  if (session?.user) {
    useAuthStore.getState().loadProfile()
  }
})

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ session, user: session?.user || null })
  if (session?.user) {
    useAuthStore.getState().loadProfile()
  } else {
    useAuthStore.setState({ profile: null })
  }
})
