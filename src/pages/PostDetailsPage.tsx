import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import { TuitionPost, Application } from '../lib/supabase'
import {
  MapPin, Calendar, Clock, Users, DollarSign, BookOpen,
  Phone, Mail, Lock, Unlock, MessageSquare, Eye, EyeOff,
  IndianRupee, QrCode, CreditCard, CheckCircle, AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PostDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { getPostById } = usePostsStore()

  const [post, setPost] = useState<TuitionPost | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr'>('razorpay')
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadPostDetails()
    }
  }, [id])

  const loadPostDetails = async () => {
    if (!id) return

    setLoading(true)
    try {
      const postData = await getPostById(parseInt(id))
      if (!postData) {
        navigate('/browse')
        return
      }

      setPost(postData)

      // Check if post is unlocked
      if (user) {
        const { data: unlockData } = await supabase
          .from('unlocks')
          .select('*')
          .eq('tutor_id', user.id)
          .eq('post_id', parseInt(id))
          .eq('status', 'paid')
          .single()

        setIsUnlocked(!!unlockData)
      }

      // Load applications if user is post owner
      if (user && postData.student_id === user.id) {
        const { data: appsData } = await supabase
          .from('applications')
          .select('*')
          .eq('post_id', parseInt(id))
          .order('created_at', { ascending: false })

        setApplications(appsData || [])
      }

    } catch (error) {
      console.error('Error loading post details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!user || !post) return

    setPaymentLoading(true)
    try {
      if (paymentMethod === 'razorpay') {
        // TODO: Implement Razorpay integration
        alert('Razorpay integration coming soon!')
      } else {
        // Manual QR payment
        const { data, error } = await supabase
          .from('manual_payments')
          .insert({
            payer_user_id: user.id,
            purpose: 'post_view',
            amount: 100, // VITE_APP_POST_VIEW_PRICE
            currency: 'INR',
            target_post_id: post.id
          })
          .select()
          .single()

        if (error) throw error

        alert('Payment request submitted! Admin will review and approve your payment.')
        setShowPaymentModal(false)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleApply = async (data: { message: string; quoted_price: number; price_type: string }) => {
    if (!user || !post || !isUnlocked) return

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          post_id: post.id,
          tutor_id: user.id,
          message: data.message,
          quoted_price: data.quoted_price,
          price_type: data.price_type
        })

      if (error) throw error

      alert('Application submitted successfully!')
      setShowApplyModal(false)
      // Refresh applications if user is post owner
      if (post.student_id === user.id) {
        loadPostDetails()
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number, type: string) => {
    const unit = type === 'hourly' ? '/hr' : type === 'monthly' ? '/month' : ''
    return `₹${price}${unit}`
  }

  const isPostOwner = user && post && post.student_id === user.id
  const canViewContact = isPostOwner || isUnlocked || (user && profile?.role === 'admin')

  if (loading) {
    return <LoadingSpinner />
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-6">The tuition post you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/browse')} className="btn-primary">
          Browse Posts
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Post Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{post.locality ? `${post.locality}, ` : ''}{post.city}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Posted on {formatDate(post.posted_on)}</span>
              <span>Post ID: #{post.id}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(post.asked_price, post.price_type || 'hourly')}
            </div>
            <div className="text-sm text-gray-600">
              {post.price_type === 'hourly' ? 'per hour' :
               post.price_type === 'monthly' ? 'per month' : 'one time'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {user && profile?.role === 'tutor' && !isPostOwner && (
            <>
              {!isUnlocked ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock Contact (₹100)
                </button>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn-accent flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Apply Now
                </button>
              )}
            </>
          )}

          {isPostOwner && (
            <button className="btn-secondary flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              View Applications ({applications.length})
            </button>
          )}
        </div>
      </div>

      {/* Post Details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {post.course && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Course:</span>
                  <p className="text-gray-900">{post.course}</p>
                </div>
              )}

              {post.board && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Board:</span>
                  <p className="text-gray-900">{post.board}</p>
                </div>
              )}

              {post.class_level && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Class:</span>
                  <p className="text-gray-900">{post.class_level}</p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-gray-700">Tuition Type:</span>
                <p className="text-gray-900">{post.tuition_type}</p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {post.subjects && post.subjects.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <BookOpen className="h-5 w-5 inline mr-2" />
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.subjects.map((subject, index) => (
                  <span key={index} className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Timing:</span>
                <span className="text-gray-900">{post.timing}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Gender Preference:</span>
                <span className="text-gray-900">{post.gender_pref}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information (Gated) */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {canViewContact ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              Contact Information
            </h2>

            {canViewContact ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Contact Unlocked</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>Student Phone: [Student's phone number]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>Student Email: [Student's email]</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md">
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Contact Locked</span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Pay ₹100 to unlock the student's contact information and apply for this tuition.
                </p>

                {user && profile?.role === 'tutor' && !isPostOwner && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full btn-primary"
                  >
                    Unlock Contact (₹100)
                  </button>
                )}

                {!user && (
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full btn-primary"
                  >
                    Sign In to Unlock
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Posted:</span>
                <span className="text-gray-900">{formatDate(post.posted_on)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="text-gray-900">{formatPrice(post.asked_price, post.price_type || 'hourly')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="text-gray-900">{post.city}</span>
              </div>
              {post.lat && post.lon && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="text-gray-900 text-xs">{post.lat.toFixed(6)}, {post.lon.toFixed(6)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Applications (for post owner) */}
      {isPostOwner && applications.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications ({applications.length})</h2>

          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Tutor Application</h3>
                    <p className="text-sm text-gray-600">
                      Applied on {formatDate(app.created_at)}
                    </p>
                  </div>
                  {app.quoted_price && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(app.quoted_price, app.price_type || 'hourly')}
                      </div>
                    </div>
                  )}
                </div>

                {app.message && (
                  <p className="text-gray-700 mb-3">{app.message}</p>
                )}

                <div className="flex gap-2">
                  <button className="btn-primary text-sm">Accept</button>
                  <button className="btn-secondary text-sm">Reject</button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm">Contact</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Unlock Contact Information</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Pay ₹100 to unlock the student's contact information and apply for this tuition.
              </p>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Razorpay (Instant)</span>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'qr')}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span>Manual QR Payment</span>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'qr' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <img
                    src="/qr-code.svg"
                    alt="Payment QR Code"
                    className="w-32 h-32 mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-600 mb-2">Scan QR code to pay ₹100</p>
                  <p className="text-xs text-gray-500">Upload screenshot after payment</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 btn-secondary"
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={paymentLoading}
                className="flex-1 btn-primary"
              >
                {paymentLoading ? 'Processing...' : 'Pay ₹100'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && isUnlocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for Tuition</h2>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleApply({
                message: formData.get('message') as string,
                quoted_price: parseInt(formData.get('quoted_price') as string),
                price_type: formData.get('price_type') as string
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Quote (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="quoted_price"
                      min="1"
                      placeholder="Amount"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                    <select
                      name="price_type"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="hourly">Per Hour</option>
                      <option value="monthly">Per Month</option>
                      <option value="onetime">One Time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Introduce yourself and explain why you're suitable for this tuition..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
