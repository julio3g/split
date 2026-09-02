import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWorkspace,
  joinWorkspace,
  listWorkspaceMembers,
  listWorkspaces,
  regenerateInviteCode,
  switchWorkspace,
  updateWorkspace,
} from './api'

export const workspacesQueryOptions = queryOptions({
  queryKey: ['workspaces'],
  queryFn: listWorkspaces,
})

export const workspaceMembersQueryOptions = queryOptions({
  queryKey: ['workspaces', 'current', 'members'],
  queryFn: listWorkspaceMembers,
})

export function useWorkspaces() {
  return useQuery(workspacesQueryOptions)
}

export function useWorkspaceMembers() {
  return useQuery(workspaceMembersQueryOptions)
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useSwitchWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: switchWorkspace,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useJoinWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: joinWorkspace,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: regenerateInviteCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesQueryOptions.queryKey })
    },
  })
}
