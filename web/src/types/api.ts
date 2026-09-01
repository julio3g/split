export type User = {
  id: string
  username: string
  email: string
}

export type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type Provider = {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ServiceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'delivered'
  | 'cancelled'

export type ServiceItem = {
  id: string
  serviceId: string
  description: string
  quantity: number
  unitPrice: number
  providerUnitPrice: number
}

export type Service = {
  id: string
  number: number
  customerId: string
  providerId: string | null
  title: string
  description: string | null
  status: ServiceStatus
  dueDate: string | null
  items: ServiceItem[]
  saleAmount: number
  providerAmount: number
  margin: number
  createdAt: string
  updatedAt: string
}

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}
