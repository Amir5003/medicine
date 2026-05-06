import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useUIStore } from '../stores/useUIStore'
import CartItem from '../components/cart/CartItem'
import Button from '../components/ui/Button'
import { formatPrice } from '../utils/formatPrice'

export default function Cart() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalAmount = useCartStore((s) => s.totalAmount())
  const totalSavings = useCartStore((s) => s.totalSavings())
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const fileInputRef = useRef(null)

  const hasRxItem = items.some((i) => i.requiresPrescription)
  const totalMrp = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0)
  const totalDiscount = totalMrp - totalAmount

  const canProceed = !hasRxItem || prescriptionFile

  const handleProceed = () => {
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-7xl mb-6">🛒</span>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse medicines and add them to your cart</p>
        <Button variant="primary" onClick={() => navigate('/')}>Shop Medicines</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 divide-y divide-gray-100">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}

          <div className="py-3 flex justify-end">
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          {/* Prescription upload */}
          {hasRxItem && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Prescription Required</p>
              <p className="text-xs text-amber-700 mb-3">
                One or more items require a doctor's prescription. Upload it below to continue.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setPrescriptionFile(e.target.files[0] || null)}
              />
              {prescriptionFile ? (
                <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-200">
                  <span className="text-xs text-gray-700 truncate">{prescriptionFile.name}</span>
                  <button
                    onClick={() => { setPrescriptionFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-red-500 text-xs ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Prescription
                </Button>
              )}
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <h2 className="font-bold text-gray-900">Price Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>MRP Total</span>
                <span>{formatPrice(totalMrp)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatPrice(totalDiscount)}</span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Alternate savings</span>
                  <span>−{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total Payable</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-2"
              disabled={!canProceed}
              onClick={handleProceed}
            >
              Proceed to Checkout
            </Button>

            {hasRxItem && !prescriptionFile && (
              <p className="text-xs text-center text-amber-600">Upload prescription to continue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
