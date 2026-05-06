import { create } from 'zustand'

/**
 * Auth store — user is populated by the useMe TanStack Query hook.
 * No persist: auth state is always derived from the server cookie.
 */
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

export default useAuthStore
