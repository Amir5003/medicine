import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/orders', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useMyOrders = (page = 1) => {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => api.get(`/api/orders?page=${page}&limit=10`),
    staleTime: 30_000,
    keepPreviousData: true,
  })
}

export const useOrderById = (id) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get(`/api/orders/${id}`),
    staleTime: 30_000,
    enabled: Boolean(id),
  })
}

export const useUploadPrescription = (orderId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => {
      const form = new FormData()
      form.append('prescription', file)
      return api.post(`/api/orders/${orderId}/prescription`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders', orderId] }),
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }) => api.patch(`/api/orders/${orderId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: (items) => api.post('/api/payment/create-order', { items }),
  })
}

export const useOrderQueue = (params = {}) => {
  const { page = 1, status } = params
  const qs = new URLSearchParams({ page, limit: 20 })
  if (status) qs.set('status', status)
  return useQuery({
    queryKey: ['orders', 'queue', params],
    queryFn: () => api.get(`/api/pharmacist/orders?${qs.toString()}`),
    staleTime: 30_000,
    keepPreviousData: true,
  })
}

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: (data) => api.post('/api/payment/verify', data),
  })
}
