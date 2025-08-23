import { useState } from 'react'
import { usePaymentStore } from '../stores/payment'
import { loadRazorpayScript, initializeRazorpayPayment, createRazorpayOrder, verifyRazorpayPayment, validatePaymentProofFile, formatFileSize, PAYMENT_AMOUNTS, CURRENCY } from '../utils/payments'
import { CreditCard, QrCode, Upload, X, AlertCircle, CheckCircle } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  purpose: 'post_view' | 'post_create'
  targetId: number
  onSuccess: (paymentMethod: 'razorpay' | 'qr') => void
  title?: string
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  purpose,
  targetId,
  onSuccess,
  title = 'Complete Payment'
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr'>('razorpay')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { loading, processUnlockPayment, processCreatePostPayment, uploadPaymentProof } = usePaymentStore()

  if (!isOpen) return null

  const handleRazorpayPayment = async () => {
    try {
      setError('')
      setSuccess('')

      const orderId = await createRazorpayOrder(amount, purpose)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: CURRENCY,
        name: 'Home Tutor Site',
        description,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const isVerified = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )

            if (isVerified) {
              setSuccess('Payment successful!')
              onSuccess('razorpay')
              setTimeout(() => {
                onClose()
              }, 2000)
            } else {
              setError('Payment verification failed')
            }
          } catch (error) {
            setError('Payment verification failed')
          }
        }
      }

      const razorpayInstance = await initializeRazorpayPayment(options)
      razorpayInstance.open()
    } catch (error: any) {
      setError(error.message || 'Failed to initialize payment')
    }
  }

  const handleQRPayment = async () => {
    try {
      setError('')
      setSuccess('')

      // Process payment record
      const success = purpose === 'post_view'
        ? await processUnlockPayment(targetId, 'qr')
        : await processCreatePostPayment(targetId, 'qr')

      if (success) {
        setSuccess('Payment request submitted! Please upload proof.')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process payment')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    const validationError = validatePaymentProofFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploadProgress(true)
    setError('')

    try {
      // First, find the payment record
      // In a real implementation, you'd get the payment ID from the previous step
      const mockPaymentId = Date.now() // This should come from the actual payment record

      const proofUrl = await uploadPaymentProof(selectedFile, mockPaymentId)

      if (proofUrl) {
        setSuccess('Payment proof uploaded successfully! Admin will review and approve.')
        setTimeout(() => {
          onSuccess('qr')
          onClose()
        }, 3000)
      } else {
        setError('Failed to upload payment proof')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload payment proof')
    } finally {
      setUploadProgress(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount to pay:</span>
              <span className="text-2xl font-bold text-primary">₹{amount}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {!success && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Choose Payment Method</h3>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="font-medium">Razorpay</span>
                        <p className="text-sm text-gray-600">Instant payment</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="radio"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'qr')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-gray-600" />
                      <div>
                        <span className="font-medium">Manual QR Payment</span>
                        <p className="text-sm text-gray-600">Upload payment proof</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Razorpay Payment */}
              {paymentMethod === 'razorpay' && !success && (
                <div className="text-center">
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    className="w-full btn-primary"
                  >
                    {loading ? 'Processing...' : `Pay ₹${amount} with Razorpay`}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    You will be redirected to Razorpay's secure payment page
                  </p>
                </div>
              )}

              {/* QR Payment */}
              {paymentMethod === 'qr' && !success && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <img
                      src="/qr-code.svg"
                      alt="Payment QR Code"
                      className="w-32 h-32 mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-600 mb-2">
                      Scan QR code to pay ₹{amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      After payment, upload the screenshot as proof
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Payment Proof
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="payment-proof"
                      />
                      <label
                        htmlFor="payment-proof"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to select payment proof image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </span>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">
                            {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </span>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleQRPayment}
                    disabled={loading || !selectedFile}
                    className="w-full btn-primary"
                  >
                    {loading ? 'Processing...' : 'Submit Payment Request'}
                  </button>

                  {selectedFile && (
                    <button
                      onClick={handleFileUpload}
                      disabled={uploadProgress}
                      className="w-full btn-secondary"
                    >
                      {uploadProgress ? 'Uploading...' : 'Upload Proof & Complete'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
