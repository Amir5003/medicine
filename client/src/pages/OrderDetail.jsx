import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useOrderById } from '../hooks/useOrders'
import Badge from '../components/ui/Badge'
import { SkeletonPanel } from '../components/ui/Skeleton'
import { formatPrice } from '../utils/formatPrice'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

function StatusTracker({ currentStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus)
  const isCancelled = currentStatus === 'cancelled'
  const shouldReduceMotion = useReducedMotion()

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-red-600">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-between mt-2">
      {/* connector bar */}
      <div className="absolute inset-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded -translate-y-1/2 z-0" />
      <motion.div
        className="absolute inset-y-1/2 left-0 h-1 bg-teal-500 rounded -translate-y-1/2 z-0"
        initial={{ width: shouldReduceMotion ? `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` : 0 }}
        animate={{ width: currentIdx === 0 ? '0%' : `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
      />
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx
        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                done ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300'
              }`}
            >
              {done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-xs font-medium capitalize ${done ? 'text-teal-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { data, isLoading, isError } = useOrderById(id)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SkeletonPanel />
      </div>
    )
  }

  if (isError || !data?.order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 font-medium">Order not found or failed to load.</p>
        <Link to="/orders" className="mt-4 inline-block text-teal-600 text-sm hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    )
  }

  const order = data.order

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/orders" className="text-sm text-teal-600 hover:underline">
            ← Back to My Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Order #{order.orderNumber ?? order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant="status" status={order.status} />
      </div>

      {/* Status tracker */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Status</h2>
        <StatusTracker currentStatus={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Items Ordered</h2>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              {item.medicine?.imageUrl ? (
                <img
                  src={item.medicine.imageUrl}
                  alt={item.medicine.name}
                  className="w-14 h-14 object-contain rounded-xl border border-gray-100 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💊</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.medicine?.name ?? item.name ?? 'Medicine'}
                </p>
                <p className="text-xs text-gray-400">
                  {item.medicine?.brand ?? ''} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-semibold text-gray-700">Total Paid</span>
          <span className="text-base font-bold text-teal-700">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</h2>
          <p className="text-sm font-semibold text-gray-900">{order.deliveryAddress.label}</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {order.deliveryAddress.line1}
            {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ''}
          </p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
          </p>
        </div>
      )}

      {/* Prescription */}
      {order.prescriptionUrl && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Prescription</h2>
          <a
            href={order.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-teal-600 hover:underline font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L21 13" />
            </svg>
            View Prescription
          </a>
        </div>
      )}

      {/* Payment Status */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Payment</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-700'
                : order.paymentStatus === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {order.paymentStatus ?? 'pending'}
          </span>
          <span className="text-sm text-gray-500 capitalize">{order.paymentMethod ?? 'Razorpay'}</span>
        </div>
      </div>
    </div>
  )
}
