import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

/**
 * Returns the alternates array from the medicine detail response.
 * Shares the same TanStack Query cache key as useMedicineBySlug — no extra network request.
 *
 * @param {string} slug
 * @returns {{ alternates: Array, isLoading: boolean, isError: boolean }}
 */
export const useAlternates = (slug) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['medicine', slug],
    queryFn: () => api.get(`/api/medicines/${slug}`),
    enabled: !!slug,
    staleTime: 30_000,
    select: (res) => res.data,
  })

  return {
    alternates: data?.alternates ?? [],
    isLoading,
    isError,
  }
}

export default useAlternates
