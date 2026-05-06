import { formatPrice } from '../../utils/formatPrice'

/**
 * Displays a savings badge in rupees.
 *
 * savings > 0  → green "Save ₹{amount}"
 * savings === 0 → gray "Same Price"
 * savings < 0 or null/undefined → renders nothing
 */
export default function SavingsBadge({ savings, className = '' }) {
  if (savings === null || savings === undefined || savings < 0) return null

  const base =
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'

  if (savings === 0) {
    return (
      <span className={`${base} bg-gray-100 text-gray-600 ${className}`}>
        Same Price
      </span>
    )
  }

  return (
    <span className={`${base} bg-green-100 text-green-700 ${className}`}>
      Save {formatPrice(savings)}
    </span>
  )
}
