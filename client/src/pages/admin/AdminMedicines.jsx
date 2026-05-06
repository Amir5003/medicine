import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api.js'
import { useSoftDeleteMedicine, useReactivateMedicine } from '../../hooks/useAdmin.js'
import { formatPrice } from '../../utils/formatPrice.js'
import Skeleton from '../../components/ui/Skeleton.jsx'

function useMedicinesCatalog(params) {
  return useQuery({
    queryKey: ['admin', 'medicines', params],
    queryFn: () => api.get('/api/admin/medicines', { params }),
    placeholderData: (prev) => prev,
  })
}

export default function AdminMedicines() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('') // '' | 'true' | 'false'
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useMedicinesCatalog({
    page,
    limit: 20,
    search: search || undefined,
    isActive: activeFilter !== '' ? activeFilter : undefined,
  })

  const deactivate = useSoftDeleteMedicine()
  const reactivate = useReactivateMedicine()

  const medicines = data?.data ?? []
  const totalPages = data?.pages ?? 1

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medicine Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Deactivate or reactivate medicines</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or brand…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isError && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">Failed to load medicines.</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Medicine</th>
              <th className="text-left px-5 py-3 font-medium">Brand</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">MRP</th>
              <th className="text-left px-5 py-3 font-medium">Stock</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              : medicines.map((m) => {
                  const isProcessing =
                    (deactivate.isPending && deactivate.variables === m._id) ||
                    (reactivate.isPending && reactivate.variables === m._id)

                  return (
                    <tr key={m._id} className={`hover:bg-gray-50 transition-colors ${!m.isActive ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {m.imageUrl && (
                            <img src={m.imageUrl} alt={m.name} className="w-8 h-8 rounded-lg object-cover" />
                          )}
                          <span className="font-medium text-gray-900 line-clamp-1">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{m.brand}</td>
                      <td className="px-5 py-4 text-gray-500">{m.category}</td>
                      <td className="px-5 py-4 text-gray-700">{formatPrice(m.mrp)}</td>
                      <td className="px-5 py-4">
                        <span className={m.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {m.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {m.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {m.isActive ? (
                          <button
                            onClick={() => deactivate.mutate(m._id)}
                            disabled={isProcessing}
                            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivate.mutate(m._id)}
                            disabled={isProcessing}
                            className="text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50 font-medium"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>

        {!isLoading && !medicines.length && (
          <p className="text-center py-12 text-gray-400 text-sm">No medicines found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
