import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { TuitionPost, TuitionPostFormData } from '../lib/supabase'

interface PostsState {
  posts: TuitionPost[]
  loading: boolean
  error: string | null
  fetchPosts: (filters?: any) => Promise<void>
  createPost: (data: TuitionPostFormData) => Promise<{ success: boolean; postId?: number }>
  getPostById: (id: number) => Promise<TuitionPost | null>
  updatePost: (id: number, updates: Partial<TuitionPost>) => Promise<boolean>
  deletePost: (id: number) => Promise<boolean>
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async (filters = {}) => {
    set({ loading: true, error: null })

    try {
      let query = supabase
        .from('tuition_posts')
        .select('*')
        .order('posted_on', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }
      if (filters.course) {
        query = query.ilike('course', `%${filters.course}%`)
      }
      if (filters.minPrice) {
        query = query.gte('asked_price', filters.minPrice)
      }
      if (filters.maxPrice) {
        query = query.lte('asked_price', filters.maxPrice)
      }
      if (filters.tuition_type) {
        query = query.eq('tuition_type', filters.tuition_type)
      }

      const { data, error } = await query

      if (error) throw error
      set({ posts: data || [] })
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error fetching posts:', error)
    } finally {
      set({ loading: false })
    }
  },

  createPost: async (data: TuitionPostFormData) => {
    set({ loading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user location from profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('city, locality, lat, lon')
        .eq('user_id', user.id)
        .single()

      const postData = {
        student_id: user.id,
        title: data.title,
        course: data.course || null,
        subjects: data.subjects,
        board: data.board || null,
        class_level: data.class_level || null,
        city: data.city,
        locality: data.locality || profile?.locality || null,
        timing: data.timing,
        gender_pref: data.gender_pref,
        tuition_type: data.tuition_type,
        price_type: data.price_type,
        asked_price: data.asked_price,
        description: data.description,
        lat: profile?.lat || null,
        lon: profile?.lon || null
      }

      const { data: post, error } = await supabase
        .from('tuition_posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error

      // Refresh posts
      await get().fetchPosts()

      return { success: true, postId: post.id }
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error creating post:', error)
      return { success: false }
    } finally {
      set({ loading: false })
    }
  },

  getPostById: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('tuition_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error fetching post:', error)
      return null
    }
  },

  updatePost: async (id: number, updates: Partial<TuitionPost>) => {
    try {
      const { error } = await supabase
        .from('tuition_posts')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Refresh posts
      await get().fetchPosts()
      return true
    } catch (error: any) {
      console.error('Error updating post:', error)
      return false
    }
  },

  deletePost: async (id: number) => {
    try {
      const { error } = await supabase
        .from('tuition_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh posts
      await get().fetchPosts()
      return true
    } catch (error: any) {
      console.error('Error deleting post:', error)
      return false
    }
  }
}))
