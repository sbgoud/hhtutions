import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface UserProfile {
  user_id: string
  role: 'tutor' | 'student'
  full_name: string | null
  phone: string | null
  city: string | null
  locality: string | null
  lat: number | null
  lon: number | null
  created_at: string
}

export interface TuitionPost {
  id: number
  student_id: string
  title: string
  course: string | null
  subjects: string[] | null
  board: string | null
  class_level: string | null
  city: string | null
  locality: string | null
  timing: string | null
  gender_pref: string | null
  tuition_type: string | null
  price_type: string | null
  asked_price: number
  description: string | null
  lat: number | null
  lon: number | null
  posted_on: string
  created_at: string
}

export interface Unlock {
  id: number
  tutor_id: string
  post_id: number
  amount: number
  currency: string
  provider: string | null
  status: string
  created_at: string
}

export interface Application {
  id: number
  post_id: number
  tutor_id: string
  message: string | null
  quoted_price: number | null
  price_type: string | null
  created_at: string
}

export interface ManualPayment {
  id: number
  payer_user_id: string
  purpose: string
  amount: number
  currency: string
  target_post_id: number | null
  proof_url: string | null
  status: string
  reviewed_by: string | null
  created_at: string
  updated_at: string
}
