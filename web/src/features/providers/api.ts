import { apiFetch } from '@/lib/api'
import type { Provider } from '@/types/api'

export type ProviderInput = {
  name: string
  phone?: string
  email?: string
  notes?: string
}

export function listProviders() {
  return apiFetch<Provider[]>('/providers')
}

export function getProvider(id: string) {
  return apiFetch<Provider>(`/providers/${id}`)
}

export function createProvider(input: ProviderInput) {
  return apiFetch<Provider>('/providers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProvider(id: string, input: Partial<ProviderInput>) {
  return apiFetch<Provider>(`/providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteProvider(id: string) {
  return apiFetch<void>(`/providers/${id}`, { method: 'DELETE' })
}
