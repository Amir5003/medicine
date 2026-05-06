import { useState } from 'react'
import {
  useAdminSalts,
  useCreateSalt,
  useUpdateSalt,
  useDeleteSalt,
} from '../../hooks/useAdmin.js'
import Modal from '../../components/ui/Modal.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

function SaltForm({ initial, onSubmit, isLoading, submitLabel, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ name, description })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g. Paracetamol"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          placeholder="Optional description…"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminSalts() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [createOpen, setCreateOpen] = useState(false)
  const [editSalt, setEditSalt] = useState(null) // salt object | null
  const [deleteTarget, setDeleteTarget] = useState(null) // salt object | null
  const [errorMsg, setErrorMsg] = useState('')

  const { data, isLoading, isError } = useAdminSalts({ page, limit: 20, search: search || undefined })
  const createSalt = useCreateSalt()
  const updateSalt = useUpdateSalt()
  const deleteSalt = useDeleteSalt()

  const salts = data?.salts ?? []

  function handleCreate(vals) {
    setErrorMsg('')
    createSalt.mutate(vals, {
      onSuccess: () => setCreateOpen(false),
      onError: (e) => setErrorMsg(e?.error?.message ?? e?.message ?? 'Error creating salt'),
    })
  }

  function handleUpdate(vals) {
    setErrorMsg('')
    updateSalt.mutate({ id: editSalt._id, ...vals }, {
      onSuccess: () => setEditSalt(null),
      onError: (e) => setErrorMsg(e?.error?.message ?? e?.message ?? 'Error updating salt'),
    })
  }

  function handleDelete() {
    setErrorMsg('')
    deleteSalt.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e) => setErrorMsg(e?.error?.message ?? e?.message ?? 'Error deleting salt'),
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active pharmaceutical ingredients</p>
        </div>
        <button
          onClick={() => { setErrorMsg(''); setCreateOpen(true) }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Salt
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search salts…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {isError && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">Failed to load salts.</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Description</th>
              <th className="text-left px-5 py-3 font-medium">Medicines</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              : salts.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-4 text-gray-500 max-w-xs truncate">{s.description || '—'}</td>
                    <td className="px-5 py-4 text-gray-700">{s.medicineCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setErrorMsg(''); setEditSalt(s) }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setErrorMsg(''); setDeleteTarget(s) }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && !salts.length && (
          <p className="text-center py-12 text-gray-400 text-sm">No salts found.</p>
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
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {data.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="px-6 pt-6 pb-0">
          <h2 className="text-lg font-bold text-gray-900">Add Salt</h2>
          {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>
        <SaltForm
          onSubmit={handleCreate}
          isLoading={createSalt.isPending}
          submitLabel="Create"
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editSalt} onClose={() => setEditSalt(null)}>
        <div className="px-6 pt-6 pb-0">
          <h2 className="text-lg font-bold text-gray-900">Edit Salt</h2>
          {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>
        {editSalt && (
          <SaltForm
            key={editSalt._id}
            initial={editSalt}
            onSubmit={handleUpdate}
            isLoading={updateSalt.isPending}
            submitLabel="Save changes"
            onCancel={() => setEditSalt(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Delete Salt</h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteSalt.isPending}
              className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {deleteSalt.isPending ? 'Deleting…' : 'Delete'}
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
