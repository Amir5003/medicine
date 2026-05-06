import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

/**
 * Search medicines by query string (and optional category).
 * Only fires when q.length > 0.
 */
export const useSearchMedicines = (q = '', category = null) =>
  useQuery({
    queryKey: ['medicines', 'search', q, category],
    queryFn: () =>
      api.get(
        `/api/medicines/search?q=${encodeURIComponent(q)}${
          category ? `&category=${encodeURIComponent(category)}` : ''
        }`
      ),
    enabled: q.length > 0,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  })

/**
 * Fetch a single medicine by slug, including alternates from the server.
 */
export const useMedicineBySlug = (slug) =>
  useQuery({
    queryKey: ['medicine', slug],
    queryFn: () => api.get(`/api/medicines/${slug}`),
    enabled: !!slug,
    staleTime: 30_000,
    select: (res) => res.data,
  })

/**
 * Fetch top trending medicines (sorted by salesCount).
 */
export const useTrending = () =>
  useQuery({
    queryKey: ['medicines', 'trending'],
    queryFn: () => api.get('/api/medicines/trending'),
    staleTime: 60_000,
    select: (res) => res.data ?? [],
  })

/**
 * Fetch the list of distinct medicine categories.
 */
export const useCategories = () =>
  useQuery({
    queryKey: ['medicines', 'categories'],
    queryFn: () => api.get('/api/medicines/categories'),
    staleTime: 60_000,
    select: (res) => res.data ?? [],
  })

// ─── Pharmacist / Admin hooks ─────────────────────────────────────────────────

export const useInventory = (params = {}) => {
  const { page = 1, limit = 20, category, lowStock, search } = params
  const qs = new URLSearchParams({ page, limit })
  if (category) qs.set('category', category)
  if (lowStock) qs.set('lowStock', 'true')
  if (search) qs.set('search', search)

  return useQuery({
    queryKey: ['pharmacist', 'inventory', params],
    queryFn: () => api.get(`/api/pharmacist/inventory?${qs.toString()}`),
    staleTime: 30_000,
    keepPreviousData: true,
  })
}

export const usePatchInventoryStock = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stock }) => api.patch(`/api/pharmacist/inventory/${id}`, { stock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pharmacist', 'inventory'] }),
  })
}

export const useCreateMedicine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) =>
      api.post('/api/medicines', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist', 'inventory'] })
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
    },
  })
}

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) =>
      api.put(`/api/medicines/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist', 'inventory'] })
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
    },
  })
}

export const usePharmacistDashboard = () =>
  useQuery({
    queryKey: ['pharmacist', 'dashboard'],
    queryFn: () => api.get('/api/pharmacist/dashboard'),
    staleTime: 60_000,
    select: (res) => res.stats,
  })
