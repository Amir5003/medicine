import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchMedicines, useCategories } from '../hooks/useMedicines'
import MedicineCard from '../components/medicine/MedicineCard'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [activeCategory, setActiveCategory] = useState(null)

  const { data: results = [], isLoading } = useSearchMedicines(q, activeCategory)
  const { data: categories = [] } = useCategories()

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {q ? `Results for "${q}"` : 'Search Medicines'}
        </h1>
        {!isLoading && q && (
          <p className="text-sm text-gray-500 mt-1">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ─── Category filter chips ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
              !activeCategory
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── Results ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !q ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-sm">Enter a medicine name, brand, or salt to search</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">😕</div>
          <p className="font-medium">No medicines found for &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-1">Try a different name or check the spelling</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((medicine) => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  )
}
