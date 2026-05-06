import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useUIStore } from '../stores/useUIStore'
import { useMe, useAddAddress } from '../hooks/useAuth'
import { usePlaceOrder, useCreatePaymentOrder, useVerifyPayment } from '../hooks/useOrders'
import Button from '../components/ui/Button'
import { formatPrice } from '../utils/formatPrice'

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
  const addAddress = useAddAddress()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addAddress.mutateAsync(form)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3 mt-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Label (Home, Work…)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Address Line 1 *"
          required
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Line 2 (optional)"
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="City *"
          required
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="State *"
          required
          value={form.state}
          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Pincode *"
          required
          pattern="\d{6}"
          value={form.pincode}
          onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
          Set as default address
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" loading={addAddress.isPending}>Save Address</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalAmount = useCartStore((s) => s.totalAmount())
  const totalSavings = useCartStore((s) => s.totalSavings())
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  const { data: meData } = useMe()
  const addresses = meData?.user?.addresses || []

  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [payError, setPayError] = useState(null)
  const [paying, setPaying] = useState(false)

  const placeOrder = usePlaceOrder()
  const createPaymentOrder = useCreatePaymentOrder()
  const verifyPayment = useVerifyPayment()

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
  const activeAddressId = selectedAddressId || defaultAddr?._id

  const totalMrp = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0)

  const handlePayNow = async () => {
    if (!user) {
      openLoginModal()
      return
    }

    if (!activeAddressId) {
      setPayError('Please add a delivery address.')
      return
    }

    setPayError(null)
    setPaying(true)

    try {
      // 1. Create Razorpay order
      const orderItems = items.map((i) => ({
        medicineId: i._id,
        quantity: i.quantity,
        isAlternateChosen: i.isAlternateChosen,
        originalMedicineId: i.originalMedicineId,
        originalPrice: i.mrp,
      }))

      const { order: rzpOrder } = await createPaymentOrder.mutateAsync(orderItems)

      // 2. Place order in our DB first
      const { order: dbOrder } = await placeOrder.mutateAsync({
        items: orderItems,
        addressId: activeAddressId,
        razorpayOrderId: rzpOrder.id,
      })

      // 3. Open Razorpay checkout widget
      await new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          order_id: rzpOrder.id,
          name: 'MediCore',
          description: 'Medicine Order',
          prefill: { name: user.name, email: user.email },
          theme: { color: '#0D9488' },
          handler: async (response) => {
            try {
              await verifyPayment.mutateAsync({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: dbOrder._id,
              })
              clearCart()
              navigate(`/order-success/${dbOrder._id}`)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        }

        if (!window.Razorpay) {
          reject(new Error('Razorpay SDK not loaded'))
          return
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      })
    } catch (err) {
      setPayError(err.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Your cart is empty. <a href="/" className="text-teal-600 hover:underline">Shop now</a></p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Address + Order review */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>

            {!user ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-3">Login to manage your delivery addresses</p>
                <Button variant="secondary" size="sm" onClick={openLoginModal}>Login / Register</Button>
              </div>
            ) : addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">No addresses saved yet.</p>
                <Button variant="secondary" size="sm" onClick={() => setShowAddressForm(true)}>+ Add Address</Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        activeAddressId === addr._id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={activeAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-0.5 accent-teal-600"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">Default</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="mt-3 text-sm text-teal-600 hover:underline"
                  >
                    + Add new address
                  </button>
                )}
              </>
            )}

            {showAddressForm && (
              <AddressForm onSave={() => setShowAddressForm(false)} onCancel={() => setShowAddressForm(false)} />
            )}
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Order Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">💊</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatPrice(item.discountedPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Summary + Pay */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="font-bold text-gray-900">Bill Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>MRP Total</span>
                <span>{formatPrice(totalMrp)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−{formatPrice(totalMrp - totalAmount)}</span>
              </div>
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

            {payError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{payError}</p>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full mt-2"
              loading={paying || placeOrder.isPending || verifyPayment.isPending}
              onClick={handlePayNow}
            >
              {user ? `Pay ${formatPrice(totalAmount)}` : 'Login to Pay'}
            </Button>

            {!user && (
              <p className="text-xs text-center text-gray-500">
                You'll be asked to login when you click Pay
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
