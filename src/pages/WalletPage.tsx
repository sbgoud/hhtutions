import { useState } from 'react'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import { Wallet, CreditCard, DollarSign, Plus, Copy, ExternalLink } from 'lucide-react'

export default function WalletPage() {
  const { user, profile } = useAuthStore()
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState('')
  const [utrNumber, setUtrNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your wallet</h2>
        </div>
      </div>
    )
  }

  const generateUPILink = (amount: string) => {
    const timestamp = Date.now()
    return `upi://pay?pa=kannaind@ybl&pn=HHTUTIONS&am=${amount}&cu=INR&tn=${timestamp}`
  }

  const generateQRText = (amount: string) => {
    const timestamp = Date.now()
    return `upi://pay?pa=kannaind@ybl&pn=HHTUTIONS&am=${amount}&cu=INR&tn=${timestamp}`
  }

  const handleAddMoney = async () => {
    if (!amount || !utrNumber) {
      alert('Please enter amount and UTR number')
      return
    }

    if (!user || !profile) {
      alert('Please login to add money to wallet')
      return
    }

    setLoading(true)
    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const timestamp = Date.now()

      // Save transaction to Supabase
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_phone: profile.phone,
          user_name: profile.full_name,
          amount: parseInt(amount),
          currency: 'INR',
          transaction_type: 'credit',
          payment_method: 'upi',
          utr_number: utrNumber,
          transaction_id: transactionId,
          upi_ref: timestamp.toString(),
          status: 'pending'
        })
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Transaction saved:', data)
      alert('Transaction submitted successfully! Admin will verify and add funds to your wallet.')
      setShowAddMoney(false)
      setAmount('')
      setUtrNumber('')
      setTransactionId('')
    } catch (error: any) {
      console.error('Error submitting transaction:', error)
      alert(`Error submitting transaction: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">My Wallet</h1>
            <p className="text-sm sm:text-base text-gray-600">Add funds to pay for posting and viewing contact details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Balance</h3>
                  <p className="text-sm text-gray-600">Available funds</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-primary">₹0.00</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payments</h3>
                  <p className="text-sm text-gray-600">Transaction history</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-accent">0</div>
            </div>

            <div className="card sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add Money</h3>
                  <p className="text-sm text-gray-600">Top up your wallet</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Money
              </button>
            </div>
          </div>

          {/* Add Money Modal */}
          {showAddMoney && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Money to Wallet</h3>

                {!transactionId ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        placeholder="Enter amount"
                        min="1"
                      />
                    </div>

                    {amount && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">Scan QR code or use UPI link to pay</p>
                          <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            <p className="text-sm font-mono break-all">{generateQRText(amount)}</p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generateUPILink(amount))
                                alert('UPI link copied to clipboard!')
                              }}
                              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy UPI Link</span>
                            </button>
                            <a
                              href={generateUPILink(amount)}
                              className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Pay via UPI App</span>
                            </a>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UTR Number (Transaction Reference)
                          </label>
                          <input
                            type="text"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="Enter UTR number from transaction"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Find UTR in your UPI app's transaction details
                          </p>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowAddMoney(false)}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddMoney}
                            disabled={loading}
                            className="flex-1 bg-primary text-white py-3 px-4 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            {loading ? 'Submitting...' : 'Submit Transaction'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Transaction Submitted!</h4>
                    <p className="text-gray-600 mb-4">
                      Your transaction will be verified by our admin team and funds will be added to your wallet.
                    </p>
                    <button
                      onClick={() => setShowAddMoney(false)}
                      className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="card">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Razorpay</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Inactive</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Manual UPI Payment</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Enter amount and scan QR code or use UPI link</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Make payment through your UPI app</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Enter UTR number and submit transaction</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>Admin verifies and adds funds to your wallet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 card">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h3>
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
