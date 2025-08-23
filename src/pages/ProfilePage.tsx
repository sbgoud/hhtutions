import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { MapPin, User, Phone, Globe } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    locality: '',
    role: 'tutor' as 'tutor' | 'student'
  })
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        locality: profile.locality || '',
        role: profile.role || 'tutor'
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
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

      // Update form with coordinates
      await updateProfile({
        lat: latitude,
        lon: longitude
      })

      // Try to get city/locality from coordinates using Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
        )
        const data = await response.json()

        if (data && data.address) {
          const city = data.address.city || data.address.town || data.address.village || ''
          const locality = data.address.suburb || data.address.neighbourhood || ''

          setFormData(prev => ({
            ...prev,
            city,
            locality
          }))

          await updateProfile({
            city,
            locality,
            lat: latitude,
            lon: longitude
          })
        }
      } catch (reverseGeocodeError) {
        console.log('Reverse geocoding failed, but coordinates saved')
      }

      alert('Location updated successfully!')
    } catch (error: any) {
      console.error('Error getting location:', error)

      // Fallback to IP-based location
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        if (data.city) {
          setFormData(prev => ({
            ...prev,
            city: data.city,
            locality: data.region || ''
          }))

          await updateProfile({
            city: data.city,
            locality: data.region || ''
          })

          alert('Approximate location set based on IP address')
        }
      } catch (ipError) {
        alert('Unable to get location. Please enter manually.')
      }
    } finally {
      setLocationLoading(false)
    }
  }

  if (!user) {
    return <div>Please sign in to view your profile</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
        <p className="text-lg text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="tutor"
                  checked={formData.role === 'tutor'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'tutor' | 'student' }))}
                  className="mr-2"
                />
                Tutor - I want to teach students
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'tutor' | 'student' }))}
                  className="mr-2"
                />
                Student - I need a tutor
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
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
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality/Area
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your locality or area"
                />
              </div>
            </div>

            {profile?.lat && profile?.lon && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Location saved:</strong> {profile.lat.toFixed(6)}, {profile.lon.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
