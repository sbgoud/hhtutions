import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { LogOut, User, Plus, Settings, Home, Search, Wallet } from 'lucide-react'

const ADMIN_EMAILS = ['shashank2bandari@gmail.com', 'dineshsomishetti@gmail.com']

export default function TopNav() {
  const { user, profile, signOut } = useAuthStore()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HT</span>
            </div>
            <span className="font-bold text-xl text-primary">Home Tutor Site</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/browse"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/browse') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse Tuitions</span>
            </Link>

            {user && (
              <Link
                to="/create"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create') ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Post+</span>
              </Link>
            )}

            {user && (
              <Link
                to="/wallet"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/wallet') ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {profile?.full_name || user.email}
                </span>
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {profile?.role}
                </span>

                <Link
                  to="/profile"
                  className={`p-2 rounded-md transition-colors ${
                    isActive('/profile') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`p-2 rounded-md transition-colors ${
                      isActive('/admin') ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Admin"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2">
            <Link
              to="/"
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/browse"
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/browse') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse</span>
            </Link>

            {user && (
              <Link
                to="/create"
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create') ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Post+</span>
              </Link>
            )}

            {user && (
              <Link
                to="/wallet"
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/wallet') ? 'bg-accent text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
