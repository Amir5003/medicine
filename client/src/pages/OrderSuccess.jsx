import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useOrderById } from '../hooks/useOrders'
import Badge from '../components/ui/Badge'
import { SkeletonPanel } from '../components/ui/Skeleton'
import { formatPrice } from '../utils/formatPrice'

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: '📋' },
  { status: 'processing', label: 'Processing', icon: '⚙️' },
  { status: 'shipped', label: 'Shipped', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '✅' },
]

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered']

function ConfettiPiece({ delay, x, color }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return null
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: 0 }}
      initial={{ y: -10, opacity: 1, rotate: 0 }}
      animate={{ y: 300, opacity: 0, rotate: 360 }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    />
  )
}

export default function OrderSuccess() {
  const { id } = useParams()
  const shouldReduce = useReducedMotion()
  const { data, isLoading } = useOrderById(id)
  const order = data?.order

  const confettiColors = ['#0D9488', '#34D399', '#FCD34D', '#F87171', '#60A5FA']
  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : 0

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <SkeletonPanel />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Confetti layer */}
      <div className="relative overflow-hidden h-8 mb-2">
        {!shouldReduce && Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={i * 0.05}
            x={Math.random() * 100}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={shouldReduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
        {order && (
          <p className="text-teal-600 font-semibold text-lg mt-1">{order.orderNumber}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Thank you for your order. We'll keep you updated.
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4"
        initial={shouldReduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
        <div className="flex items-start justify-between relative">
          {/* connector line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-teal-500 transition-all duration-700"
            style={{ width: currentStep === 0 ? '0%' : `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
          />

          {TIMELINE_STEPS.map((step, idx) => {
            const done = idx <= currentStep
            return (
              <motion.div
                key={step.status}
                className="flex flex-col items-center gap-2 z-10"
                initial={shouldReduce ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors ${
                  done ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {done ? '✓' : step.icon}
                </div>
                <span className={`text-xs font-medium ${done ? 'text-teal-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Order details */}
      {order && (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 space-y-3"
          initial={shouldReduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Items</h2>
            <Badge variant="status" status={order.status} />
          </div>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.medicine?.imageUrl
                    ? <img src={item.medicine.imageUrl} alt={item.medicine.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">💊</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.medicine?.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total Paid</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </motion.div>
      )}

      <motion.div
        className="flex gap-3"
        initial={shouldReduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link
          to="/orders"
          className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl py-3 transition-colors"
        >
          My Orders
        </Link>
        <Link
          to="/"
          className="flex-1 text-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl py-3 transition-colors"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  )
}
