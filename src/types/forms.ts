import { z } from 'zod'

// Tuition Post Creation Schema
export const tuitionPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  course: z.string().optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  board: z.string().optional(),
  class_level: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  locality: z.string().optional(),
  timing: z.enum(['Morning', 'Afternoon', 'Evening', 'AnyTime']),
  gender_pref: z.enum(['Any', 'Male', 'Female']),
  tuition_type: z.enum(['Home Tuition', 'At Tutor Home', 'At Institute', 'Online']),
  price_type: z.enum(['hourly', 'monthly', 'onetime']),
  asked_price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters')
})

export type TuitionPostFormData = z.infer<typeof tuitionPostSchema>

// Application Schema
export const applicationSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  quoted_price: z.number().min(1, 'Price must be greater than 0'),
  price_type: z.enum(['hourly', 'monthly', 'onetime'])
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

// Profile Schema
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(15, 'Phone number must be less than 15 characters'),
  city: z.string().min(2, 'City is required'),
  locality: z.string().optional(),
  role: z.enum(['tutor', 'student'])
})

export type ProfileFormData = z.infer<typeof profileSchema>
