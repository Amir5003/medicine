import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import Layout from './components/layout/Layout'
import { SkeletonPanel } from './components/ui/Skeleton'
import { useAuthStore } from './stores/useAuthStore'
import { ROLES } from '../../shared/roles.js'

// ─── Lazy page imports ───────────────────────────────────────────────────────
// Patient pages (Phase 3 + 4)
const Home = lazy(() => import('./pages/Home'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const MedicineDetail = lazy(() => import('./pages/MedicineDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Profile = lazy(() => import('./pages/Profile'))

// Pharmacist pages (Phase 5)
const PharmacistDashboard = lazy(() => import('./pages/pharmacist/PharmacistDashboard'))
const Inventory = lazy(() => import('./pages/pharmacist/Inventory'))
const OrdersQueue = lazy(() => import('./pages/pharmacist/OrdersQueue'))

// Admin pages (Phase 6)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminMedicines = lazy(() => import('./pages/admin/AdminMedicines'))
const AdminSalts = lazy(() => import('./pages/admin/AdminSalts'))

// ─── Fallback loading screen ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="py-12">
      <SkeletonPanel />
    </div>
  )
}

// ─── Role guard components ────────────────────────────────────────────────────

/**
 * Redirects to home (opening login modal via state) when user is not authenticated.
 */
function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/" state={{ openLogin: true, from: location.pathname }} replace />
  }
  return children
}

/**
 * Redirects to home when user does not have the required role.
 * Admin always passes any role check.
 */
function RequireRole({ role, children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/" state={{ openLogin: true, from: location.pathname }} replace />
  }
  if (user.role !== role && user.role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />
  }
  return children
}

// Helper to wrap a page with Suspense + role guard
function page(Component, Guard = null) {
  const wrapped = <Suspense fallback={<PageLoader />}><Component /></Suspense>
  if (!Guard) return wrapped
  return <Guard>{wrapped}</Guard>
}

// ─── Router ──────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: page(Home) },
      { path: 'search', element: page(SearchResults) },
      { path: 'medicine/:slug', element: page(MedicineDetail) },
      { path: 'cart', element: page(Cart) },
      { path: 'checkout', element: page(Checkout) },
      { path: 'order-success/:id', element: <RequireAuth>{page(OrderSuccess)}</RequireAuth> },
      { path: 'orders', element: <RequireAuth>{page(MyOrders)}</RequireAuth> },
      { path: 'orders/:id', element: <RequireAuth>{page(OrderDetail)}</RequireAuth> },
      { path: 'profile', element: <RequireAuth>{page(Profile)}</RequireAuth> },

      // Pharmacist routes
      { path: 'pharmacist', element: <RequireRole role={ROLES.PHARMACIST}>{page(PharmacistDashboard)}</RequireRole> },
      { path: 'pharmacist/inventory', element: <RequireRole role={ROLES.PHARMACIST}>{page(Inventory)}</RequireRole> },
      { path: 'pharmacist/orders', element: <RequireRole role={ROLES.PHARMACIST}>{page(OrdersQueue)}</RequireRole> },

      // Admin routes
      { path: 'admin', element: <RequireRole role={ROLES.ADMIN}>{page(AdminDashboard)}</RequireRole> },
      { path: 'admin/users', element: <RequireRole role={ROLES.ADMIN}>{page(AdminUsers)}</RequireRole> },
      { path: 'admin/medicines', element: <RequireRole role={ROLES.ADMIN}>{page(AdminMedicines)}</RequireRole> },
      { path: 'admin/salts', element: <RequireRole role={ROLES.ADMIN}>{page(AdminSalts)}</RequireRole> },
    ],
  },
])

// ─── TanStack Query client ────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── Mount ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)

