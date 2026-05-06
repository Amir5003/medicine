import { useState } from 'react'
import Modal from '../ui/Modal'
import { useUIStore } from '../../stores/useUIStore'
import { useLogin, useRegister } from '../../hooks/useAuth'

export default function AuthModal() {
  const isOpen = useUIStore((s) => s.loginModalOpen)
  const closeLoginModal = useUIStore((s) => s.closeLoginModal)

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' })
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState('')

  const login = useLogin()
  const register = useRegister()

  const isPending = login.isPending || register.isPending

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login.mutateAsync({ email: form.email, password: form.password })
      } else {
        if (!form.name.trim()) { setError('Name is required'); return }
        const payload = { name: form.name, email: form.email, password: form.password }
        if (form.inviteCode.trim()) payload.inviteCode = form.inviteCode.trim()
        await register.mutateAsync(payload)
      }
      closeLoginModal()
      setForm({ name: '', email: '', password: '', inviteCode: '' })
      setShowInvite(false)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setForm({ name: '', email: '', password: '', inviteCode: '' })
    setShowInvite(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={closeLoginModal}>
      <div className="w-full max-w-sm p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Sign in to your MediCore account' : 'Join MediCore today'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl border border-gray-200 mb-6 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Amit Kumar"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Pharmacist invite code — optional, only shown on register */}
          {mode === 'register' && (
            <div>
              {!showInvite ? (
                <button
                  type="button"
                  onClick={() => setShowInvite(true)}
                  className="text-xs text-teal-600 hover:underline"
                >
                  Registering as a pharmacist? Enter invite code →
                </button>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pharmacist Invite Code
                    <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="inviteCode"
                    value={form.inviteCode}
                    onChange={handleChange}
                    placeholder="Enter code provided by your admin"
                    className="w-full border border-teal-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-teal-50/40"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave blank to register as a patient instead.</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm min-h-[44px]"
          >
            {isPending
              ? mode === 'login' ? 'Signing in…' : 'Creating account…'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </Modal>
  )
}
