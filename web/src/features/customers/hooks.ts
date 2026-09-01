import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  type CustomerInput,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from './api'

export const customersQueryOptions = queryOptions({
  queryKey: ['customers'],
  queryFn: listCustomers,
})

export function customerQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['customers', id],
    queryFn: () => getCustomer(id),
  })
}

export function useCustomers() {
  return useQuery(customersQueryOptions)
}

export function useCustomer(id: string) {
  return useQuery({ ...customerQueryOptions(id), enabled: Boolean(id) })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryOptions.queryKey })
    },
  })
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<CustomerInput>) => updateCustomer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryOptions.queryKey })
    },
  })
}
