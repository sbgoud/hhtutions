// Razorpay integration utilities
// Note: This is a template for Razorpay integration

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  handler: (response: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initializeRazorpayPayment = async (options: RazorpayOptions) => {
  const isLoaded = await loadRazorpayScript()

  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK')
  }

  const razorpayInstance = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.order_id,
    prefill: options.prefill,
    handler: options.handler,
    theme: {
      color: '#084d75'
    }
  })

  return razorpayInstance
}

export const createRazorpayOrder = async (amount: number, purpose: string) => {
  // This would be a server-side function in production
  // For now, return a mock order ID
  console.log(`Creating Razorpay order for ${purpose}: ₹${amount}`)

  // In production, this would call your backend API
  // const response = await fetch('/api/create-razorpay-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, purpose })
  // })
  // const data = await response.json()
  // return data.order_id

  return `order_${Date.now()}` // Mock order ID
}

export const verifyRazorpayPayment = async (paymentId: string, orderId: string, signature: string) => {
  // This would be a server-side function in production
  // to verify payment signature from Razorpay

  console.log('Verifying Razorpay payment:', { paymentId, orderId, signature })

  // In production, this would call your backend API
  // const response = await fetch('/api/verify-razorpay-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ paymentId, orderId, signature })
  // })
  // const data = await response.json()
  // return data.success

  return true // Mock success
}

// Payment amount constants
export const PAYMENT_AMOUNTS = {
  POST_VIEW: parseInt(import.meta.env.VITE_APP_POST_VIEW_PRICE || '100'),
  POST_CREATE: parseInt(import.meta.env.VITE_APP_POST_CREATE_PRICE || '100')
}

// Currency
export const CURRENCY = import.meta.env.VITE_APP_CURRENCY || 'INR'

// Payment descriptions
export const PAYMENT_DESCRIPTIONS = {
  POST_VIEW: 'Unlock contact information for tuition post',
  POST_CREATE: 'Create new tuition post'
}

// File upload utilities for payment proofs
export const validatePaymentProofFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'Please upload an image file'
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB
    return 'File size must be less than 5MB'
  }

  return null
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
