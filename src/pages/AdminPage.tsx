import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import {
  CheckCircle, XCircle, Clock, Users, FileText, CreditCard,
  Eye, AlertCircle, BarChart3, Settings, UserCheck, UserX,
  Calendar, TrendingUp
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface ManualPayment {
  id: number
  payer_user_id: string
  purpose: string
  amount: number
  currency: string
  target_post_id: number | null
  proof_url: string | null
  status: string
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface UserProfile {
  user_id: string
  full_name: string | null
  phone: string | null
  city: string | null
  role: string
  created_at: string
}

interface TuitionPost {
  id: number
  title: string
  student_id: string
  city: string | null
  posted_on: string
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  pendingPayments: number
  approvedPayments: number
  totalRevenue: number
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'users' | 'posts'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalRevenue: 0
  })
  const [manualPayments, setManualPayments] = useState<ManualPayment[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [posts, setPosts] = useState<TuitionPost[]>([])
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const ADMIN_EMAILS = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com']
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin, activeTab])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'overview') {
        await loadOverviewStats()
      } else if (activeTab === 'payments') {
        await loadManualPayments()
      } else if (activeTab === 'users') {
        await loadUsers()
      } else if (activeTab === 'posts') {
        await loadPosts()
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverviewStats = async () => {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get post count
      const { count: postCount } = await supabase
        .from('tuition_posts')
        .select('*', { count: 'exact', head: true })

      // Get payment stats
      const { data: payments } = await supabase
        .from('manual_payments')
        .select('amount, status')

      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0
      const approvedPayments = payments?.filter(p => p.status === 'approved').length || 0
      const totalRevenue = payments?.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0) || 0

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        pendingPayments,
        approvedPayments,
        totalRevenue
      })
    } catch (error) {
      console.error('Error loading overview stats:', error)
    }
  }

  const loadManualPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_payments')
        .select(`
          *,
          profiles:user_profiles!manual_payments_payer_user_id_fkey (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setManualPayments(data || [])
    } catch (error) {
      console.error('Error loading manual payments:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('tuition_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const handlePaymentAction = async (paymentId: number, action: 'approved' | 'rejected') => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('manual_payments')
        .update({
          status: action,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (error) throw error

      // If approving post_view payment, create unlock record
      if (action === 'approved') {
        const payment = manualPayments.find(p => p.id === paymentId)
        if (payment?.purpose === 'post_view' && payment.target_post_id) {
          const { data: { user: payerUser } } = await supabase.auth.getUser()
          if (payerUser) {
            await supabase
              .from('unlocks')
              .insert({
                tutor_id: payment.payer_user_id,
                post_id: payment.target_post_id,
                amount: payment.amount,
                currency: payment.currency,
                provider: 'manual_qr',
                status: 'paid'
              })
          }
        }
      }

      // Refresh data
      await loadManualPayments()
      if (activeTab === 'overview') {
        await loadOverviewStats()
      }

      setSelectedPayment(null)
      alert(`Payment ${action} successfully!`)
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform content and payments</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'posts', label: 'Posts', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>

            <div className="card text-center">
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>

            <div className="card text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </div>

            <div className="card text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('payments')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <CreditCard className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-gray-900">Review Payments</h3>
                <p className="text-sm text-gray-600">Approve or reject manual payments</p>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <Users className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
              >
                <FileText className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium text-gray-900">Moderate Posts</h3>
                <p className="text-sm text-gray-600">Review and moderate content</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manual Payments</h2>
            <div className="text-sm text-gray-600">
              {manualPayments.filter(p => p.status === 'pending').length} pending
            </div>
          </div>

          <div className="space-y-4">
            {manualPayments.map((payment) => (
              <div key={payment.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {payment.profiles?.full_name || 'Unknown User'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>Amount: ₹{payment.amount}</div>
                      <div>Purpose: {payment.purpose.replace('_', ' ')}</div>
                      <div>Date: {formatDate(payment.created_at)}</div>
                    </div>

                    {payment.proof_url && (
                      <button
                        onClick={() => window.open(payment.proof_url!, '_blank')}
                        className="text-primary hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Payment Proof
                      </button>
                    )}
                  </div>

                  {payment.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handlePaymentAction(payment.id, 'approved')}
                        disabled={actionLoading}
                        className="btn-primary text-sm flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handlePaymentAction(payment.id, 'rejected')}
                        disabled={actionLoading}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="text-sm text-gray-600">
              {users.length} total users
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.city || 'Not set'}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Content Moderation</h2>
            <div className="text-sm text-gray-600">
              {posts.length} recent posts
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>Post #{post.id}</span>
                      <span>{post.city || 'Location not set'}</span>
                      <span>{formatDate(post.posted_on)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button className="btn-primary text-sm">View</button>
                    <button className="btn-secondary text-sm">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
