import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, login, logout, register } from './api'

export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: getMe,
})

export function useMe() {
  return useQuery(meQueryOptions)
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: user => {
      queryClient.setQueryData(meQueryOptions.queryKey, user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: register,
    onSuccess: user => {
      queryClient.setQueryData(meQueryOptions.queryKey, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
