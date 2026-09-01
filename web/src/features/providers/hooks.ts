import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProvider,
  deleteProvider,
  getProvider,
  listProviders,
  type ProviderInput,
  updateProvider,
} from './api'

export const providersQueryOptions = queryOptions({
  queryKey: ['providers'],
  queryFn: listProviders,
})

export function providerQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['providers', id],
    queryFn: () => getProvider(id),
  })
}

export function useProviders() {
  return useQuery(providersQueryOptions)
}

export function useProvider(id: string) {
  return useQuery({ ...providerQueryOptions(id), enabled: Boolean(id) })
}

export function useCreateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providersQueryOptions.queryKey })
    },
  })
}

export function useUpdateProvider(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<ProviderInput>) => updateProvider(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providersQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ['providers', id] })
    },
  })
}

export function useDeleteProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providersQueryOptions.queryKey })
    },
  })
}
