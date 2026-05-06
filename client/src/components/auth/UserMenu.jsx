import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLogout } from '../../hooks/useAuth'
import { ROLES } from '../../../../shared/roles.js'

// Role badge colours
const ROLE_STYLES = {
  [ROLES.ADMIN]: 'bg-red-100 text-red-700',
  [ROLES.PHARMACIST]: 'bg-teal-100 text-teal-700',
  [ROLES.PATIENT]: 'bg-gray-100 text-gray-600',
}
const ROLE_LABEL = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.PATIENT]: 'Patient',
}

// Nav links per role (shown in the dropdown)
const ROLE_LINKS = {
  [ROLES.PHARMACIST]: [
    { to: '/pharmacist', label: 'Dashboard' },
    { to: '/pharmacist/inventory', label: 'Inventory' },
    { to: '/pharmacist/orders', label: 'Orders Queue' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/medicines', label: 'Medicines' },
    { to: '/admin/salts', label: 'Salts' },
  ],
  [ROLES.PATIENT]: [
    { to: '/orders', label: 'My Orders' },
    { to: '/profile', label: 'Profile' },
  ],
}

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const clearUser = useAuthStore((s) => s.clearUser)
  const logout = useLogout()

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  async function handleLogout() {
    setOpen(false)
    try {
      await logout.mutateAsync()
    } catch {
      // cookie may have already expired — clear locally anyway
      clearUser()
    }
    navigate('/')
  }

  const roleLinks = ROLE_LINKS[user.role] ?? ROLE_LINKS[ROLES.PATIENT]
  const firstName = user.name?.split(' ')[0] ?? 'Account'

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-teal-600 px-2 py-2 rounded-xl hover:bg-teal-50 transition-colors min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar circle */}
        <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {firstName[0]?.toUpperCase()}
        </span>
        <span className="hidden sm:inline">{firstName}</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_STYLES[user.role] ?? ROLE_STYLES[ROLES.PATIENT]}`}>
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>

          {/* Role-specific nav links */}
          <div className="py-1">
            {roleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Divider + logout */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {logout.isPending ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
