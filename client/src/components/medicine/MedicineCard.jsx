import { Link } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import SavingsBadge from './SavingsBadge'
import { formatPrice } from '../../utils/formatPrice'

/**
 * Compact medicine card used in grids (Home trending, SearchResults).
 * Clicking the image or name navigates to /medicine/:slug.
 * "Add to Cart" calls useCartStore.addItem.
 */
export default function MedicineCard({ medicine, showAddToCart = true }) {
  const addItem = useCartStore((s) => s.addItem)

  const savings = (medicine.mrp ?? 0) - (medicine.discountedPrice ?? 0)
  const isOutOfStock = medicine.stock <= 0

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md">
      {/* Out-of-stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image */}
      <Link to={`/medicine/${medicine.slug}`} className="block flex-shrink-0">
        {medicine.imageUrl ? (
          <img
            src={medicine.imageUrl}
            alt={medicine.name}
            className="w-full h-36 object-cover bg-gray-50"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-4xl">
            💊
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {medicine.requiresPrescription && <Badge variant="rx" />}
          {medicine.category && <Badge variant="category" label={medicine.category} />}
        </div>

        {/* Name + Brand */}
        <Link to={`/medicine/${medicine.slug}`} className="block min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-teal-600 transition-colors">
            {medicine.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{medicine.brand}</p>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(medicine.discountedPrice)}
          </span>
          {savings > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(medicine.mrp)}
            </span>
          )}
        </div>

        <SavingsBadge savings={savings} />

        {/* Add to Cart */}
        {showAddToCart && (
          <Button
            variant="primary"
            size="sm"
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addItem(medicine)}
            className="w-full mt-1"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  )
}
