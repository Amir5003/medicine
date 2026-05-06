import { useParams } from 'react-router-dom'
import { useMedicineBySlug } from '../hooks/useMedicines'
import { useCartStore } from '../stores/useCartStore'
import { SkeletonPanel } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import AlternatePanel from '../components/medicine/AlternatePanel'
import SavingsBadge from '../components/medicine/SavingsBadge'
import { formatPrice } from '../utils/formatPrice'

export default function MedicineDetail() {
  const { slug } = useParams()
  // alternates are embedded in the same response as the medicine
  const { data: medicine, isLoading, isError } = useMedicineBySlug(slug)
  const addItem = useCartStore((s) => s.addItem)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-4">
        <SkeletonPanel />
      </div>
    )
  }

  if (isError || !medicine) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="text-5xl mb-4">😕</div>
        <p className="font-medium">Medicine not found</p>
      </div>
    )
  }

  const savings = (medicine.mrp ?? 0) - (medicine.discountedPrice ?? 0)
  const isOutOfStock = medicine.stock <= 0
  const alternates = medicine.alternates ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ─── Main detail card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image */}
          <div className="flex-shrink-0">
            {medicine.imageUrl ? (
              <img
                src={medicine.imageUrl}
                alt={medicine.name}
                className="w-full sm:w-48 h-48 object-cover rounded-xl bg-gray-50"
              />
            ) : (
              <div className="w-full sm:w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-6xl">
                💊
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {medicine.requiresPrescription && <Badge variant="rx" />}
              {medicine.category && <Badge variant="category" label={medicine.category} />}
            </div>

            {/* Names */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{medicine.name}</h1>
              <p className="text-gray-500">{medicine.brand}</p>
              {medicine.genericName && (
                <p className="text-sm text-gray-400">Generic: {medicine.genericName}</p>
              )}
            </div>

            {/* Salt composition */}
            {medicine.salts?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Salt Composition
                </p>
                <div className="flex flex-wrap gap-1">
                  {medicine.salts.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full"
                    >
                      {s.name} {s.strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(medicine.discountedPrice)}
              </span>
              {savings > 0 && (
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(medicine.mrp)}
                </span>
              )}
              <SavingsBadge savings={savings} />
            </div>

            {/* Stock status */}
            <p
              className={`text-sm font-medium ${
                isOutOfStock ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : `In Stock (${medicine.stock} units available)`}
            </p>

            <Button
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && addItem(medicine)}
              className="w-full sm:w-auto"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Description */}
        {medicine.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{medicine.description}</p>
          </div>
        )}
      </div>

      {/* ─── Alternate Panel ───────────────────────────────────────────────── */}
      <AlternatePanel
        alternates={alternates}
        isLoading={isLoading}
        originalMedicine={medicine}
      />
    </div>
  )
}
