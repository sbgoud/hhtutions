import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Search, Plus, MapPin, Users, Shield, Star } from 'lucide-react'

export default function HomePage() {
  const { user, profile } = useAuthStore()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Your Perfect
          <span className="text-primary"> Home Tutor</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect students with qualified tutors in your local area. Post tuition needs or browse available opportunities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user && profile?.role === 'student' && (
            <Link to="/create" className="btn-primary flex items-center justify-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Post Tuition Need</span>
            </Link>
          )}
          <Link to="/browse" className="btn-secondary flex items-center justify-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Browse Tuitions</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Home Tutor Site?</h2>
          <p className="text-lg text-gray-600">Your trusted platform for tuition connections</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Connections</h3>
            <p className="text-gray-600">Find tutors and students in your neighborhood</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Platform</h3>
            <p className="text-gray-600">Verified profiles and secure payment processing</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Matching</h3>
            <p className="text-gray-600">Smart filters to find the perfect match</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Service</h3>
            <p className="text-gray-600">Trusted platform with excellent support</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">Simple steps to get started</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
            <p className="text-gray-600">Sign up as a student or tutor and complete your profile</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Post or Browse</h3>
            <p className="text-gray-600">Students post tuition needs, tutors browse and unlock contact details</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Learn</h3>
            <p className="text-gray-600">Get connected and start your learning journey</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="bg-primary text-white rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and tutors already connecting through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Link to="/auth" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Create Account
              </Link>
            ) : profile?.role === 'student' ? (
              <Link to="/create" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Post Tuition Need
              </Link>
            ) : (
              <Link to="/browse" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Find Students
              </Link>
            )}
            <Link to="/browse" className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors">
              Browse Tuitions
            </Link>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="text-center py-8">
        <p className="text-2xl font-semibold text-primary italic">
          Learn.. Achieve!!
        </p>
      </section>
    </div>
  )
}
