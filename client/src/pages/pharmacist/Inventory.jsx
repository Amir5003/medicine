import { useState, useRef } from 'react'
import {
  useInventory,
  usePatchInventoryStock,
  useCreateMedicine,
  useUpdateMedicine,
  useCategories,
} from '../../hooks/useMedicines'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { formatPrice } from '../../utils/formatPrice'

// ─── Salt composer row ────────────────────────────────────────────────────────
function SaltRow({ salt, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Salt name *"
        required
        value={salt.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        placeholder="Strength (e.g. 500mg)"
        value={salt.strength}
        onChange={(e) => onChange(index, 'strength', e.target.value)}
        className="w-36 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-400 hover:text-red-600 text-lg leading-none"
        aria-label="Remove salt"
      >
        ×
      </button>
    </div>
  )
}

// ─── Add / Edit medicine modal ────────────────────────────────────────────────
function MedicineFormModal({ medicine, onClose }) {
  const EMPTY = {
    name: '',
    brand: '',
    genericName: '',
    category: '',
    description: '',
    mrp: '',
    discountedPrice: '',
    stock: '',
    requiresPrescription: false,
    isActive: true,
    salts: [{ name: '', strength: '' }],
  }
  const [form, setForm] = useState(medicine ? { ...medicine, salts: medicine.salts ?? [{ name: '', strength: '' }] } : EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const imageRef = useRef()

  const createMedicine = useCreateMedicine()
  const updateMedicine = useUpdateMedicine()
  const isPending = createMedicine.isPending || updateMedicine.isPending

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const setSalt = (idx, field, value) =>
    setForm((f) => {
      const salts = [...f.salts]
      salts[idx] = { ...salts[idx], [field]: value }
      return { ...f, salts }
    })

  const addSalt = () => setForm((f) => ({ ...f, salts: [...f.salts, { name: '', strength: '' }] }))
  const removeSalt = (idx) =>
    setForm((f) => ({ ...f, salts: f.salts.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'salts') fd.append('salts', JSON.stringify(v))
      else fd.append(k, v)
    })
    if (imageFile) fd.append('image', imageFile)

    if (medicine) {
      await updateMedicine.mutateAsync({ id: medicine._id, formData: fd })
    } else {
      await createMedicine.mutateAsync(fd)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {medicine ? 'Edit Medicine' : 'Add Medicine'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name *" required value={form.name} onChange={(e) => set('name', e.target.value)}
              className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="Brand *" required value={form.brand} onChange={(e) => set('brand', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="Generic Name" value={form.genericName} onChange={(e) => set('genericName', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="Category *" required value={form.category} onChange={(e) => set('category', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="MRP (₹) *" required type="number" min="0" value={form.mrp} onChange={(e) => set('mrp', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="Discounted Price (₹) *" required type="number" min="0" value={form.discountedPrice} onChange={(e) => set('discountedPrice', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input placeholder="Stock *" required type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.requiresPrescription} onChange={(e) => set('requiresPrescription', e.target.checked)} />
              Requires Prescription
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Active
            </label>
          </div>

          {/* Salts composer */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Salts / Ingredients</p>
            <div className="space-y-2">
              {form.salts.map((s, i) => (
                <SaltRow key={i} salt={s} index={i} onChange={setSalt} onRemove={removeSalt} />
              ))}
            </div>
            <button type="button" onClick={addSalt} className="mt-2 text-sm text-teal-600 font-medium hover:underline">
              + Add Salt
            </button>
          </div>

          {/* Image upload */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Medicine Image</p>
            {medicine?.imageUrl && !imageFile && (
              <img src={medicine.imageUrl} alt="current" className="w-20 h-20 object-contain rounded-xl border border-gray-100 mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              ref={imageRef}
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              className="text-sm text-teal-600 border border-teal-200 rounded-xl px-4 py-2 hover:bg-teal-50 transition"
            >
              {imageFile ? `✓ ${imageFile.name}` : 'Choose Image'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isPending}>
              {medicine ? 'Save Changes' : 'Add Medicine'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Inline stock edit cell ───────────────────────────────────────────────────
function StockCell({ medicine }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(medicine.stock))
  const patch = usePatchInventoryStock()

  const save = async () => {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 0) {
      await patch.mutateAsync({ id: medicine._id, stock: n })
    }
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`text-sm font-semibold px-3 py-1 rounded-lg transition ${
          medicine.stock === 0
            ? 'bg-red-50 text-red-600'
            : medicine.stock < 10
            ? 'bg-orange-50 text-orange-600'
            : 'bg-gray-50 text-gray-700'
        } hover:bg-teal-50 hover:text-teal-700`}
        title="Click to edit stock"
      >
        {medicine.stock}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className="w-20 border border-teal-400 rounded-lg px-2 py-1 text-sm focus:outline-none"
        autoFocus
      />
      <button onClick={save} disabled={patch.isPending} className="text-teal-600 text-xs font-bold disabled:opacity-40">✓</button>
      <button onClick={() => setEditing(false)} className="text-gray-400 text-xs">✕</button>
    </div>
  )
}

// ─── Main Inventory page ──────────────────────────────────────────────────────
export default function Inventory() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [modalMedicine, setModalMedicine] = useState(undefined) // undefined = closed, null = new, obj = edit

  const { data: categoriesData } = useCategories()
  const categories = categoriesData ?? []

  const { data, isLoading, isError } = useInventory({
    page,
    search: search || undefined,
    category: category || undefined,
    lowStock: lowStockOnly,
  })

  const medicines = data?.medicines ?? []
  const totalPages = data?.pages ?? 1
  const total = data?.total ?? 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      {/* Modal */}
      {modalMedicine !== undefined && (
        <MedicineFormModal
          medicine={modalMedicine}
          onClose={() => setModalMedicine(undefined)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} medicine{total !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => setModalMedicine(null)}>+ Add Medicine</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search name or brand…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1) }}
          />
          Low Stock (&lt;10)
        </label>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <p className="text-red-500 py-8 text-center">Failed to load inventory.</p>
      ) : medicines.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium">No medicines found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="pb-3 pr-4">Medicine</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4 text-right">MRP</th>
                <th className="pb-3 pr-4 text-right">Price</th>
                <th className="pb-3 pr-4 text-center">Stock</th>
                <th className="pb-3 pr-4 text-center">Rx</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {medicines.map((med) => (
                <tr key={med._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {med.imageUrl ? (
                        <img src={med.imageUrl} alt={med.name} className="w-10 h-10 object-contain rounded-lg border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">💊</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate max-w-[160px]">{med.name}</p>
                        <p className="text-xs text-gray-400">{med.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{med.category}</td>
                  <td className="py-3 pr-4 text-right text-gray-400 line-through">{formatPrice(med.mrp)}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-gray-900">{formatPrice(med.discountedPrice)}</td>
                  <td className="py-3 pr-4 text-center">
                    <StockCell medicine={med} />
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {med.requiresPrescription ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rx</span>
                    ) : '—'}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {med.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setModalMedicine(med)}
                      className="text-xs text-teal-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
