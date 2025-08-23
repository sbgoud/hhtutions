import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface PaymentState {
  loading: boolean
  error: string | null
  processUnlockPayment: (postId: number, method: 'razorpay' | 'qr') => Promise<boolean>
  processCreatePostPayment: (postId: number, method: 'razorpay' | 'qr') => Promise<boolean>
  uploadPaymentProof: (file: File, paymentId: number) => Promise<string | null>
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  loading: false,
  error: null,

  processUnlockPayment: async (postId: number, method: 'razorpay' | 'qr') => {
    set({ loading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (method === 'razorpay') {
        // TODO: Implement Razorpay integration
        // This would integrate with Razorpay SDK
        console.log('Processing Razorpay payment for post unlock:', postId)
        throw new Error('Razorpay integration coming soon')
      } else {
        // Manual QR payment - create payment record
        const { data, error } = await supabase
          .from('manual_payments')
          .insert({
            payer_user_id: user.id,
            purpose: 'post_view',
            amount: 100, // VITE_APP_POST_VIEW_PRICE
            currency: 'INR',
            target_post_id: postId
          })
          .select()
          .single()

        if (error) throw error
        return true
      }
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error processing unlock payment:', error)
      return false
    } finally {
      set({ loading: false })
    }
  },

  processCreatePostPayment: async (postId: number, method: 'razorpay' | 'qr') => {
    set({ loading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (method === 'razorpay') {
        // TODO: Implement Razorpay integration
        console.log('Processing Razorpay payment for post creation:', postId)
        throw new Error('Razorpay integration coming soon')
      } else {
        // Manual QR payment - create payment record
        const { data, error } = await supabase
          .from('manual_payments')
          .insert({
            payer_user_id: user.id,
            purpose: 'post_create',
            amount: 100, // VITE_APP_POST_CREATE_PRICE
            currency: 'INR',
            target_post_id: postId
          })
          .select()
          .single()

        if (error) throw error
        return true
      }
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error processing create post payment:', error)
      return false
    } finally {
      set({ loading: false })
    }
  },

  uploadPaymentProof: async (file: File, paymentId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${paymentId}/proof.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName)

      // Update manual payment record with proof URL
      const { error: updateError } = await supabase
        .from('manual_payments')
        .update({ proof_url: publicUrl })
        .eq('id', paymentId)

      if (updateError) throw updateError

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading payment proof:', error)
      return null
    }
  }
}))
