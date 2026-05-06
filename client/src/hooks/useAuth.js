import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../stores/useAuthStore'

/** Fetch the currently logged-in user. Syncs result to Zustand auth store. */
export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me'),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data?.user) setUser(query.data.user)
    if (query.isError) clearUser()
  }, [query.data, query.isError, setUser, clearUser])

  return query
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  return useMutation({
    mutationFn: (data) => api.post('/api/auth/register', data),
    onSuccess: (data) => {
      if (data.token) setToken(data.token)
      setUser(data.user)
      queryClient.setQueryData(['me'], data)
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)

  return useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data),
    onSuccess: (data) => {
      if (data.token) setToken(data.token)
      setUser(data.user)
      queryClient.setQueryData(['me'], data)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const clearUser = useAuthStore((s) => s.clearUser)
  const clearToken = useAuthStore((s) => s.clearToken)

  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => {
      clearUser()
      clearToken()
      queryClient.clear()
    },
  })
}

export const useAddAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/auth/addresses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addressId) => api.delete(`/api/auth/addresses/${addressId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}
