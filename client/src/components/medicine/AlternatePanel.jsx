import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCartStore } from '../../stores/useCartStore'
import { SkeletonPanel } from '../ui/Skeleton'
import Button from '../ui/Button'
import SavingsBadge from './SavingsBadge'
import { formatPrice } from '../../utils/formatPrice'

/**
 * AlternatePanel — shows up to 5 cheaper salt-equivalent medicines.
 *
 * Props:
 *  - alternates: array from medicine.alternates (pre-loaded in getMedicineBySlug)
 *  - isLoading: boolean
 *  - originalMedicine: the current medicine doc (used to compute real rupee savings)
 */
export default function AlternatePanel({ alternates = [], isLoading, originalMedicine }) {
  const addItem = useCartStore((s) => s.addItem)
  const shouldReduceMotion = useReducedMotion()

  if (isLoading) return <SkeletonPanel />
  if (!alternates.length) return null

  const originalPrice = originalMedicine?.discountedPrice ?? 0

  return (
    <AnimatePresence>
      <motion.div
        className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-sm font-bold text-teal-700 mb-4 uppercase tracking-wide">
          💡 Cheaper Salt Equivalents ({alternates.length})
        </h3>

        <div className="space-y-3">
          {alternates.map((alt) => {
            const savingsVsOriginal = Math.max(0, originalPrice - alt.discountedPrice)
            const isOOS = alt.stock <= 0

            return (
              <div
                key={alt._id}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100"
              >
                {/* Thumbnail */}
                {alt.imageUrl ? (
                  <img
                    src={alt.imageUrl}
                    alt={alt.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
                    💊
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{alt.name}</p>
                  <p className="text-xs text-gray-500 truncate">{alt.brand}</p>
                  <p className="text-sm font-bold text-teal-600 mt-0.5">
                    {formatPrice(alt.discountedPrice)}
                  </p>
                  {savingsVsOriginal > 0 && (
                    <SavingsBadge savings={savingsVsOriginal} className="mt-1" />
                  )}
                </div>

                {/* Add button */}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isOOS}
                  className="flex-shrink-0"
                  onClick={() =>
                    !isOOS &&
                    addItem(alt, true, originalMedicine?._id, savingsVsOriginal)
                  }
                >
                  {isOOS ? 'OOS' : 'Add'}
                </Button>
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
