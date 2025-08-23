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

// Components
import TopNav from './components/TopNav'
import LoadingSpinner from './components/LoadingSpinner'

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

  if (loading) {
    return <LoadingSpinner />
  }

  return (
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
