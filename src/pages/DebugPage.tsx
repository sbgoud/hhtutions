import { useAuthStore } from '../stores/auth'

export default function DebugPage() {
  const { user, profile, loading } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🛠️ Debug Information</h1>

        {/* Environment Variables */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">VITE_SUPABASE_URL:</span>
              <span className={`font-mono ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
              <span className={`font-mono ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">VITE_APP_CURRENCY:</span>
              <span className={`font-mono ${import.meta.env.VITE_APP_CURRENCY ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_APP_CURRENCY || '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">VITE_APP_POST_VIEW_PRICE:</span>
              <span className={`font-mono ${import.meta.env.VITE_APP_POST_VIEW_PRICE ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_APP_POST_VIEW_PRICE || '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">VITE_APP_POST_CREATE_PRICE:</span>
              <span className={`font-mono ${import.meta.env.VITE_APP_POST_CREATE_PRICE ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_APP_POST_CREATE_PRICE || '❌ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Authentication State */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication State</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Loading:</span>
              <span className={`font-mono ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? '⏳ Loading...' : '✅ Ready'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">User:</span>
              <span className={`font-mono ${user ? 'text-green-600' : 'text-gray-600'}`}>
                {user ? `✅ ${user.email}` : '❌ Not logged in'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Profile:</span>
              <span className={`font-mono ${profile ? 'text-green-600' : 'text-gray-600'}`}>
                {profile ? `✅ ${profile.full_name || 'No name'}` : '❌ No profile'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Profile Complete:</span>
              <span className={`font-mono ${profile?.is_profile_complete ? 'text-green-600' : 'text-orange-600'}`}>
                {profile?.is_profile_complete ? '✅ Complete' : '⚠️ Incomplete'}
              </span>
            </div>
          </div>
        </div>

        {/* Browser Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">User Agent:</span>
              <span className="font-mono text-gray-600 text-xs">{navigator.userAgent}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Viewport:</span>
              <span className="font-mono text-gray-600">{window.innerWidth} x {window.innerHeight}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Online:</span>
              <span className={`font-mono ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
                {navigator.onLine ? '✅ Online' : '❌ Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Reload Page
            </button>
            <button
              onClick={() => console.clear()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🧹 Clear Console
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                console.log('Storage cleared')
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Clear All Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
