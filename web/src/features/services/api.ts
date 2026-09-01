import { apiFetch } from '@/lib/api'
import type { Service, ServiceStatus } from '@/types/api'

export type ServiceItemInput = {
  description: string
  quantity: number
  unitPrice: number
  providerUnitPrice: number
}

export type CreateServiceInput = {
  customerId: string
  providerId?: string
  title: string
  description?: string
  dueDate?: string
  items: ServiceItemInput[]
}

export type UpdateServiceInput = {
  customerId?: string
  providerId?: string
  title?: string
  description?: string
  dueDate?: string
}

export function listServices() {
  return apiFetch<Service[]>('/services')
}

export function getService(id: string) {
  return apiFetch<Service>(`/services/${id}`)
}

export function createService(input: CreateServiceInput) {
  return apiFetch<Service>('/services', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateService(id: string, input: UpdateServiceInput) {
  return apiFetch<Service>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function updateServiceStatus(id: string, status: ServiceStatus) {
  return apiFetch<Service>(`/services/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function deleteService(id: string) {
  return apiFetch<void>(`/services/${id}`, { method: 'DELETE' })
}
