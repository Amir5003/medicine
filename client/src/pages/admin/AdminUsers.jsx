import { useState } from 'react'
import { useAdminUsers, useChangeUserRole } from '../../hooks/useAdmin.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { ROLES } from '../../../../shared/roles.js'
import Skeleton from '../../components/ui/Skeleton.jsx'

const ROLE_OPTIONS = Object.values(ROLES)
const ROLE_CLASS = {
  admin: 'bg-red-100 text-red-700',
  pharmacist: 'bg-blue-100 text-blue-700',
  patient: 'bg-green-100 text-green-700',
}

function RolePill({ role }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_CLASS[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const currentUser = useAuthStore((s) => s.user)

  const { data, isLoading, isError } = useAdminUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined })
  const changeRole = useChangeUserRole()

  const [pendingRole, setPendingRole] = useState({}) // { [userId]: role }

  function handleRoleChange(userId, role) {
    setPendingRole((p) => ({ ...p, [userId]: role }))
    changeRole.mutate({ id: userId, role }, {
      onSettled: () => setPendingRole((p) => { const n = { ...p }; delete n[userId]; return n }),
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user roles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">Failed to load users.</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="text-left px-5 py-3 font-medium">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              : data?.users?.map((u) => {
                  const isSelf = u._id === currentUser?._id
                  const loading = pendingRole[u._id] !== undefined

                  return (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <RolePill role={u.role} />
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">You</span>
                        ) : (
                          <select
                            value={loading ? pendingRole[u._id] : u.role}
                            disabled={loading}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>

        {!isLoading && !data?.users?.length && (
          <p className="text-center py-12 text-gray-400 text-sm">No users found.</p>
        )}
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            {page} / {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
