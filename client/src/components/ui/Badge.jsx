/**
 * Badge component
 *
 * Variants:
 *  - rx: red "Rx" prescription badge
 *  - savings: green "Save ₹X" badge (pass `label` prop)
 *  - category: teal filled category pill (pass `label` prop)
 *  - status: maps ORDER_STATUS values to colors (pass `status` prop)
 */

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function Badge({ variant = 'category', label, status, className = '' }) {
  let base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'

  if (variant === 'rx') {
    return (
      <span className={`${base} bg-red-100 text-red-700 ${className}`}>Rx</span>
    )
  }

  if (variant === 'savings') {
    return (
      <span className={`${base} bg-green-100 text-green-700 ${className}`}>
        {label}
      </span>
    )
  }

  if (variant === 'category') {
    return (
      <span className={`${base} bg-teal-100 text-teal-700 ${className}`}>
        {label}
      </span>
    )
  }

  if (variant === 'status') {
    const colors = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
    return (
      <span className={`${base} ${colors} ${className}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
      </span>
    )
  }

  return (
    <span className={`${base} bg-gray-100 text-gray-700 ${className}`}>{label}</span>
  )
}
