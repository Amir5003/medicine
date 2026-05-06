import { create } from 'zustand'

const TOKEN_KEY = 'medicore_token'

/**
 * Auth store — user is populated by useMe, token persisted in localStorage
 * so Authorization header works cross-origin (Vercel → Render).
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null })
  },
}))

export default useAuthStore
