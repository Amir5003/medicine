import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api.js'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/api/admin/dashboard').then((r) => r.stats),
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.get('/api/admin/users', { params }).then((r) => r),
    placeholderData: (prev) => prev,
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/api/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

// ─── Salts ────────────────────────────────────────────────────────────────────

export function useAdminSalts(params = {}) {
  return useQuery({
    queryKey: ['admin', 'salts', params],
    queryFn: () => api.get('/api/admin/salts', { params }).then((r) => r),
    placeholderData: (prev) => prev,
  })
}

export function useCreateSalt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/admin/salts', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'salts'] }),
  })
}

export function useUpdateSalt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/api/admin/salts/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'salts'] }),
  })
}

export function useDeleteSalt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/admin/salts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'salts'] }),
  })
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => api.get('/api/admin/orders', { params }).then((r) => r),
    placeholderData: (prev) => prev,
  })
}

// ─── Medicines (admin actions) ────────────────────────────────────────────────

export function useSoftDeleteMedicine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/admin/medicines/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['medicines'] })
    },
  })
}

export function useReactivateMedicine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.put(`/api/admin/medicines/${id}`, { isActive: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['medicines'] })
    },
  })
}
