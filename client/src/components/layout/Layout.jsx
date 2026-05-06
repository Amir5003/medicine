import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import AuthModal from '../auth/AuthModal'
import { useUIStore } from '../../stores/useUIStore'
import { useMe } from '../../hooks/useAuth'

export default function Layout() {
  const location = useLocation()
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  // Hydrate auth state from server cookie on every page load/refresh
  useMe()

  // Open login modal when redirected here by RequireAuth with openLogin state
  useEffect(() => {
    if (location.state?.openLogin) {
      openLoginModal()
    }
  }, [location.state, openLoginModal])

  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  )
}
