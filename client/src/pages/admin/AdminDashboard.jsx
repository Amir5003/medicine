import { useAdminDashboard } from '../../hooks/useAdmin.js'
import { formatPrice } from '../../utils/formatPrice.js'
import Skeleton from '../../components/ui/Skeleton.jsx'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminDashboard()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide overview</p>
      </div>

      {isError && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
          Failed to load dashboard stats. Please refresh.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Users" value={stats?.totalUsers ?? 0} accent="text-indigo-600" />
            <StatCard label="Active Medicines" value={stats?.totalMedicines ?? 0} accent="text-emerald-600" />
            <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
            <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} accent="text-amber-500" />
            <StatCard
              label="Revenue Today"
              value={formatPrice(stats?.revenueToday ?? 0)}
              accent="text-emerald-600"
            />
            <StatCard
              label="Revenue (30 days)"
              value={formatPrice(stats?.revenueLast30Days ?? 0)}
              accent="text-emerald-600"
            />
            <StatCard
              label="Low Stock Medicines"
              value={stats?.lowStockMedicines ?? 0}
              sub="< 10 units"
              accent={stats?.lowStockMedicines > 0 ? 'text-red-600' : 'text-gray-900'}
            />
            <StatCard label="Total Salts" value={stats?.totalSalts ?? 0} />
          </>
        )}
      </div>
    </div>
  )
}
