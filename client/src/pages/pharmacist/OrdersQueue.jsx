import { useState } from 'react'
import { useOrderQueue, useUpdateOrderStatus } from '../../hooks/useOrders'
import Badge from '../../components/ui/Badge'
import { SkeletonPanel } from '../../components/ui/Skeleton'
import { formatPrice } from '../../utils/formatPrice'

const TABS = [
  { label: 'Pending', status: 'pending' },
  { label: 'Processing', status: 'processing' },
  { label: 'All Active', status: undefined },
]

// Forward-only valid transitions per ORDER_STATUS
const NEXT_STATUSES = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

function OrderRow({ order }) {
  const updateStatus = useUpdateOrderStatus()
  const nextOptions = NEXT_STATUSES[order.status] ?? []
  const [selected, setSelected] = useState('')
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!selected) return
    await updateStatus.mutateAsync({ orderId: order._id, status: selected })
    setSelected('')
    setConfirming(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">
            #{order.orderNumber ?? order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {order.user && (
            <p className="text-xs text-gray-500 mt-0.5">
              {order.user.name} · {order.user.email}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="status" status={order.status} />
          <p className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.paymentStatus ?? 'pending payment'}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-3">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-xs">
            {item.medicine?.imageUrl ? (
              <img
                src={item.medicine.imageUrl}
                alt={item.medicine.name}
                className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
              />
            ) : (
              <span className="text-base">💊</span>
            )}
            <span className="font-medium text-gray-800 max-w-[120px] truncate">
              {item.medicine?.name ?? 'Medicine'}
            </span>
            <span className="text-gray-400">×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Prescription */}
      {order.prescriptionUrl && (
        <div>
          <a
            href={order.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:underline bg-teal-50 px-3 py-1.5 rounded-xl"
          >
            📎 View Prescription
          </a>
        </div>
      )}

      {/* Delivery address */}
      {order.address && (
        <p className="text-xs text-gray-500">
          📍 {order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}
        </p>
      )}

      {/* Status update */}
      {nextOptions.length > 0 && (
        <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setConfirming(false) }}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Move to…</option>
            {nextOptions.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>

          {selected && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm text-teal-600 font-semibold hover:underline"
            >
              Confirm
            </button>
          )}

          {confirming && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                Mark as <strong>{selected}</strong>?
              </span>
              <button
                onClick={handleConfirm}
                disabled={updateStatus.isPending}
                className="text-sm font-bold text-white bg-teal-600 px-3 py-1 rounded-xl hover:bg-teal-700 disabled:opacity-40 transition"
              >
                {updateStatus.isPending ? '…' : 'Yes'}
              </button>
              <button
                onClick={() => { setConfirming(false); setSelected('') }}
                className="text-sm text-gray-400 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OrdersQueue() {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)

  const currentTab = TABS[activeTab]
  const { data, isLoading, isError } = useOrderQueue({
    page,
    status: currentTab.status,
  })

  const orders = data?.orders ?? []
  const totalPages = data?.pages ?? 1
  const total = data?.total ?? 0

  const handleTabChange = (idx) => {
    setActiveTab(idx)
    setPage(1)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders Queue</h1>
        <p className="text-sm text-gray-400">{total} order{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === idx
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonPanel key={i} />)}
        </div>
      ) : isError ? (
        <p className="text-red-500 text-center py-8">Failed to load orders queue.</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium text-gray-600">No orders in this queue</p>
          <p className="text-sm mt-1">
            {currentTab.status === 'pending'
              ? 'All pending orders have been processed.'
              : 'Nothing to show here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
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
