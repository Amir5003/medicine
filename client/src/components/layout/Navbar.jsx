import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCartStore } from '../../stores/useCartStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useUIStore } from '../../stores/useUIStore'
import UserMenu from '../auth/UserMenu'

function CartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const user = useAuthStore((s) => s.user)
  const totalItems = useCartStore((s) => s.totalItems())
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer)
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-teal-600 flex-shrink-0">
          MediCore
        </Link>

        {/* Search bar — hidden on mobile (360px), use Home hero search instead) */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl min-w-0">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicines, salts, brands…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Mobile search icon - navigates to /search page */}
        <button
          onClick={() => navigate('/search')}
          className="sm:hidden p-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <SearchIcon />
        </button>

        {/* Right actions */}}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Cart button */}
          <button
            onClick={toggleCartDrawer}
            className="relative p-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open cart"
          >
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <button
              onClick={openLoginModal}
              className="text-sm font-semibold text-teal-600 border border-teal-600 px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors min-h-[44px]"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
