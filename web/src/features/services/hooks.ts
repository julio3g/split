import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ServiceStatus } from '@/types/api'
import {
  createService,
  type CreateServiceInput,
  deleteService,
  getService,
  listServices,
  updateService,
  type UpdateServiceInput,
  updateServiceStatus,
} from './api'

export const servicesQueryOptions = queryOptions({
  queryKey: ['services'],
  queryFn: listServices,
})

export function serviceQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['services', id],
    queryFn: () => getService(id),
  })
}

export function useServices() {
  return useQuery(servicesQueryOptions)
}

export function useService(id: string) {
  return useQuery(serviceQueryOptions(id))
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryOptions.queryKey })
    },
  })
}

export function useUpdateService(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateServiceInput) => updateService(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ['services', id] })
    },
  })
}

export function useUpdateServiceStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ServiceStatus) => updateServiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ['services', id] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryOptions.queryKey })
    },
  })
}
