import { apiFetch } from '@/lib/api'
import type { Workspace, WorkspaceMember } from '@/types/api'

export function listWorkspaces() {
  return apiFetch<Workspace[]>('/api/workspaces')
}

export function createWorkspace(name: string) {
  return apiFetch<Workspace>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function switchWorkspace(id: string) {
  return apiFetch<Workspace>(`/api/workspaces/${id}/switch`, {
    method: 'POST',
  })
}

export function joinWorkspace(inviteCode: string) {
  return apiFetch<Workspace>('/api/workspaces/join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  })
}

export function updateWorkspace(name: string) {
  return apiFetch<Workspace>('/api/workspaces/current', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

export function regenerateInviteCode() {
  return apiFetch<Workspace>('/api/workspaces/current/invite-code/regenerate', {
    method: 'POST',
  })
}

export function listWorkspaceMembers() {
  return apiFetch<WorkspaceMember[]>('/api/workspaces/current/members')
}
