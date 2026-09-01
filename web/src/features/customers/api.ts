import { apiFetch } from '@/lib/api'
import type { Customer } from '@/types/api'

export type CustomerInput = {
  name: string
  phone?: string
  email?: string
  notes?: string
}

export function listCustomers() {
  return apiFetch<Customer[]>('/customers')
}

export function getCustomer(id: string) {
  return apiFetch<Customer>(`/customers/${id}`)
}

export function createCustomer(input: CustomerInput) {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateCustomer(id: string, input: Partial<CustomerInput>) {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteCustomer(id: string) {
  return apiFetch<void>(`/customers/${id}`, { method: 'DELETE' })
}
