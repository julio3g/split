import { apiFetch } from '@/lib/api'
import type { User } from '@/types/api'

export type LoginInput = {
  username: string
  password: string
}

export type RegisterInput = {
  username: string
  email: string
  password: string
  inviteCode?: string
  workspaceName?: string
}

export function getMe() {
  return apiFetch<User>('/api/user')
}

export function login(input: LoginInput) {
  return apiFetch<User>('/api/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function register(input: RegisterInput) {
  return apiFetch<User>('/api/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function logout() {
  return apiFetch<void>('/api/logout', { method: 'POST' })
}
