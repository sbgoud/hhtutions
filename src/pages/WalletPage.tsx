import { useAuthStore } from '../stores/auth'
import { Wallet, CreditCard, DollarSign } from 'lucide-react'

export default function WalletPage() {
  const { user, profile } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your wallet</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
            <p className="text-gray-600">Manage your payments and transactions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Balance</h3>
                  <p className="text-sm text-gray-600">Available funds</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">₹0.00</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                  <p className="text-sm text-gray-600">Transaction history</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-accent">0</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
                  <p className="text-sm text-gray-600">Total earned</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">₹0.00</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-left">
                  Add Money to Wallet
                </button>
                <button className="w-full btn-secondary text-left">
                  View Payment History
                </button>
                <button className="w-full btn-secondary text-left">
                  Download Statements
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Razorpay</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Manual Payment</span>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your transaction history will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
