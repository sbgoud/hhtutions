import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import { tuitionPostSchema, type TuitionPostFormData } from '../types/forms'
import { MapPin, DollarSign, Clock, Users, BookOpen, Globe } from 'lucide-react'

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
  'History', 'Geography', 'Economics', 'Computer Science', 'Accountancy',
  'Business Studies', 'Social Science', 'Science', 'General Knowledge'
]

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Others']
const CLASS_LEVELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'AnyTime']
const GENDER_PREFS = ['Any', 'Male', 'Female']
const TUITION_TYPES = ['Home Tuition', 'At Tutor Home', 'At Institute', 'Online']
const PRICE_TYPES = ['hourly', 'monthly', 'onetime']

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { createPost, loading } = usePostsStore()
  const [locationLoading, setLocationLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TuitionPostFormData>({
    resolver: zodResolver(tuitionPostSchema),
    defaultValues: {
      title: '',
      course: '',
      subjects: [],
      board: '',
      class_level: '',
      city: profile?.city || '',
      locality: profile?.locality || '',
      timing: 'AnyTime',
      gender_pref: 'Any',
      tuition_type: 'Home Tuition',
      price_type: 'hourly',
      asked_price: 0,
      description: ''
    }
  })

  const watchedSubjects = watch('subjects')

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = watchedSubjects || []
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject]

    setValue('subjects', newSubjects)
  }

  const getCurrentLocation = async () => {
    setLocationLoading(true)

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords

      // Try to get city/locality from coordinates
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
        )
        const data = await response.json()

        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.village || ''
          const locality = data.address.suburb || data.address.neighbourhood || ''

          setValue('city', city)
          setValue('locality', locality)
        }
      } catch (reverseGeocodeError) {
        console.log('Reverse geocoding failed')
      }
    } catch (error: any) {
      console.error('Error getting location:', error)

      // Fallback to IP-based location
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        if (data.city) {
          setValue('city', data.city)
          setValue('locality', data.region || '')
        }
      } catch (ipError) {
        console.error('IP location fallback failed')
      }
    } finally {
      setLocationLoading(false)
    }
  }

  const onSubmit = async (data: TuitionPostFormData) => {
    const result = await createPost(data)

    if (result.success) {
      alert('Tuition post created successfully!')
      navigate(`/post/${result.postId}`)
    } else {
      alert('Error creating post. Please try again.')
    }
  }

  if (!user || profile?.role !== 'student') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">Only students can create tuition posts.</p>
        <button
          onClick={() => navigate('/profile')}
          className="btn-primary"
        >
          Update Profile
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Tuition Need</h1>
        <p className="text-lg text-gray-600">Create a detailed post to find the perfect tutor</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="e.g., Need Math Tutor for 10th Grade CBSE"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course (optional)
              </label>
              <input
                {...register('course')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="e.g., Engineering, Medical, Commerce"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-2" />
                Subjects *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUBJECTS.map((subject) => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={watchedSubjects?.includes(subject) || false}
                      onChange={() => handleSubjectToggle(subject)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
              {errors.subjects && (
                <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board (optional)
                </label>
                <select
                  {...register('board')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Board</option>
                  {BOARDS.map((board) => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Level (optional)
                </label>
                <select
                  {...register('class_level')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Location Information</h2>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="btn-secondary flex items-center space-x-2"
            >
              {locationLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              <span>{locationLoading ? 'Getting Location...' : 'Get My Location'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                City *
              </label>
              <input
                {...register('city')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locality/Area (optional)
              </label>
              <input
                {...register('locality')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your locality or area"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Preferred Timing
              </label>
              <select
                {...register('timing')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                {TIMINGS.map((timing) => (
                  <option key={timing} value={timing}>{timing}</option>
                ))}
              </select>
              {errors.timing && (
                <p className="mt-1 text-sm text-red-600">{errors.timing.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-2" />
                Gender Preference
              </label>
              <select
                {...register('gender_pref')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                {GENDER_PREFS.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              {errors.gender_pref && (
                <p className="mt-1 text-sm text-red-600">{errors.gender_pref.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tuition Type
              </label>
              <select
                {...register('tuition_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                {TUITION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.tuition_type && (
                <p className="mt-1 text-sm text-red-600">{errors.tuition_type.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Price Type
              </label>
              <select
                {...register('price_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                {PRICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'hourly' ? 'Per Hour' : type === 'monthly' ? 'Per Month' : 'One Time'}
                  </option>
                ))}
              </select>
              {errors.price_type && (
                <p className="mt-1 text-sm text-red-600">{errors.price_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asked Price (₹)
              </label>
              <input
                {...register('asked_price', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter amount"
              />
              {errors.asked_price && (
                <p className="mt-1 text-sm text-red-600">{errors.asked_price.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Description</h2>

          <div>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Describe your tuition requirements in detail. Include any specific topics, learning goals, or special requirements..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-lg px-8 py-3"
          >
            {loading ? 'Creating Post...' : 'Create Tuition Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
