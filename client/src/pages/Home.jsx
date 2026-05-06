import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrending, useCategories } from '../hooks/useMedicines'
import MedicineCard from '../components/medicine/MedicineCard'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const { data: trending = [], isLoading: trendingLoading } = useTrending()
  const { data: categories = [] } = useCategories()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const visibleTrending = activeCategory
    ? trending.filter((m) => m.category === activeCategory)
    : trending

  return (
    <div className="space-y-10">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl px-6 py-14 text-white text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
          Find Medicines.&nbsp;Save&nbsp;More.
        </h1>
        <p className="text-teal-100 mb-8 text-sm sm:text-base max-w-md mx-auto">
          Discover cheaper salt-equivalent medicines and save on every order.
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, salts, brands…"
            autoFocus
            aria-label="Search medicines"
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/60 min-h-[44px]"
          />
          <button
            type="submit"
            className="bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors min-h-[44px] sm:w-auto w-full"
          >
            Search
          </button>
        </form>
      </section>

      {/* ─── Category chips ────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Browse by Category</h2>
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
        </section>
      )}

      {/* ─── Trending ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Trending Medicines</h2>

        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleTrending.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            {activeCategory ? `No trending medicines in "${activeCategory}".` : 'No medicines added yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleTrending.map((medicine) => (
              <MedicineCard key={medicine._id} medicine={medicine} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
