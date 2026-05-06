import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCartStore } from '../../stores/useCartStore'
import { useUIStore } from '../../stores/useUIStore'
import CartItem from './CartItem'
import Button from '../ui/Button'
import { formatPrice } from '../../utils/formatPrice'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { cartDrawerOpen, closeCartDrawer } = useUIStore()
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const totalAmount = useCartStore((s) => s.totalAmount())
  const totalSavings = useCartStore((s) => s.totalSavings())
  const shouldReduceMotion = useReducedMotion()

  const hasRxItem = items.some((i) => i.requiresPrescription)

  const drawerVariants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            {...drawerVariants}
            transition={shouldReduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Cart {totalItems > 0 && <span className="text-teal-600">({totalItems})</span>}
              </h2>
              <button
                onClick={closeCartDrawer}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="text-5xl mb-4">🛒</span>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add medicines to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <CartItem key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                {/* Rx warning */}
                {hasRxItem && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <span className="text-amber-500 shrink-0">⚠️</span>
                    <p className="text-xs text-amber-700">
                      Your cart has Rx medicine(s). Prescription upload required at checkout.
                    </p>
                  </div>
                )}

                {/* Savings */}
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total savings</span>
                    <span className="text-green-600 font-semibold">−{formatPrice(totalSavings)}</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-900">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                </div>

                {/* CTAs */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => { closeCartDrawer(); navigate('/cart') }}
                  >
                    View Cart
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => { closeCartDrawer(); navigate('/checkout') }}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
