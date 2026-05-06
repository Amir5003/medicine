import { useCartStore } from '../../stores/useCartStore'
import { formatPrice } from '../../utils/formatPrice'

export default function CartItem({ item }) {
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 truncate">{item.brand}</p>

        {/* Alternate savings label */}
        {item.isAlternateChosen && item.savingsAmount > 0 && (
          <p className="text-xs text-green-600 font-medium mt-0.5">
            Alternate chosen — Save {formatPrice(item.savingsAmount)}
          </p>
        )}

        {/* Price + Qty stepper */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.discountedPrice * item.quantity)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(item._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQty(item._id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>

            {/* Remove */}
            <button
              onClick={() => removeItem(item._id)}
              className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
