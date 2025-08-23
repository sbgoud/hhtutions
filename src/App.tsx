import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { useEffect } from 'react'

// Pages
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import PostDetailsPage from './pages/PostDetailsPage'
import CreatePostPage from './pages/CreatePostPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import WalletPage from './pages/WalletPage'
import DebugPage from './pages/DebugPage'

// Components
import TopNav from './components/TopNav'
import LoadingSpinner from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'

const ADMIN_EMAILS = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com']

function ProtectedRoute({ children, requireAuth = true, requireStudent = false, requireTutor = false, requireAdmin = false }: {
  children: React.ReactNode
  requireAuth?: boolean
  requireStudent?: boolean
  requireTutor?: boolean
  requireAdmin?: boolean
}) {
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return <LoadingSpinner />
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />
  }

  if (requireStudent && profile?.role !== 'student') {
    return <Navigate to="/" replace />
  }

  if (requireTutor && profile?.role !== 'tutor') {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user && !ADMIN_EMAILS.includes(user.email || '')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { loading } = useAuthStore()

  // Add error boundary and debug info
  console.log('App component rendering...')
  console.log('Environment variables:', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    currency: import.meta.env.VITE_APP_CURRENCY,
  })

  // Check for missing critical environment variables
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing critical environment variables!')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Missing required environment variables. Please check your Vercel configuration.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Required variables:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
              <li>• VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
              <li>• VITE_APP_CURRENCY: {import.meta.env.VITE_APP_CURRENCY ? '✅ Set' : '❌ Missing'}</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    console.log('App is in loading state...')
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <TopNav />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/post/:id" element={<PostDetailsPage />} />
              <Route path="/unlock/:id" element={
                <ProtectedRoute requireAuth requireTutor>
                  <div>Unlock Page (Coming Soon)</div>
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute requireAuth>
                  <CreatePostPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requireAuth>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute requireAuth>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/auth" element={<AuthPage />} />
            <Route path="/debug" element={<DebugPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
