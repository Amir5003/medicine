import { Link } from 'react-router-dom'
import { usePharmacistDashboard } from '../../hooks/useMedicines'
import { SkeletonCard } from '../../components/ui/Skeleton'

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function PharmacistDashboard() {
  const { data: stats, isLoading, isError } = usePharmacistDashboard()

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pharmacist Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 font-medium">Failed to load dashboard stats.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders}
          icon="⏳"
          color="bg-yellow-50"
        />
        <StatCard
          label="Processing Orders"
          value={stats?.processingOrders}
          icon="🔄"
          color="bg-blue-50"
        />
        <StatCard
          label="Delivered Today"
          value={stats?.todayDeliveries}
          icon="✅"
          color="bg-green-50"
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats?.lowStockCount}
          icon="⚠️"
          color="bg-orange-50"
        />
        <StatCard
          label="Total Medicines"
          value={stats?.totalMedicines}
          icon="💊"
          color="bg-teal-50"
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/pharmacist/inventory"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
          >
            📦 Manage Inventory
          </Link>
          <Link
            to="/pharmacist/orders"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
          >
            📋 Orders Queue
            {stats?.pendingOrders > 0 && (
              <span className="ml-1 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.pendingOrders}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}
