import { useState } from 'react'
import { useMe, useAddAddress, useDeleteAddress } from '../hooks/useAuth'
import { useAuthStore } from '../stores/useAuthStore'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonPanel } from '../components/ui/Skeleton'

const ROLE_LABEL = { patient: 'Patient', pharmacist: 'Pharmacist', admin: 'Admin' }

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })
  const addAddress = useAddAddress()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addAddress.mutateAsync(form)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3 mt-3 border border-gray-100">
      <p className="text-sm font-semibold text-gray-700">New Address</p>
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Label (Home, Work…)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Address Line 1 *"
          required
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Line 2 (optional)"
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="City *"
          required
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="State *"
          required
          value={form.state}
          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Pincode *"
          required
          pattern="\d{6}"
          title="6-digit pincode"
          value={form.pincode}
          onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          Set as default address
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" loading={addAddress.isPending}>
          Save Address
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function Profile() {
  const { data, isLoading } = useMe()
  const deleteAddress = useDeleteAddress()
  const user = useAuthStore((s) => s.user)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const profileUser = data?.user ?? user

  if (isLoading && !profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SkeletonPanel />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    )
  }

  const addresses = profileUser.addresses ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* User Info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-600 select-none">
              {profileUser.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{profileUser.name}</p>
              <p className="text-sm text-gray-500">{profileUser.email}</p>
            </div>
          </div>
          <Badge
            variant="category"
            label={ROLE_LABEL[profileUser.role] ?? profileUser.role}
          />
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Saved Addresses</h2>
          {!showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-sm text-teal-600 font-medium hover:underline"
            >
              + Add Address
            </button>
          )}
        </div>

        {addresses.length === 0 && !showAddressForm && (
          <p className="text-sm text-gray-400 py-4 text-center">No saved addresses yet.</p>
        )}

        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-gray-800">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
              <button
                onClick={() => deleteAddress.mutate(addr._id)}
                disabled={deleteAddress.isPending}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0 mt-0.5 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {showAddressForm && (
          <AddressForm
            onSave={() => setShowAddressForm(false)}
            onCancel={() => setShowAddressForm(false)}
          />
        )}
      </div>
    </div>
  )
}
