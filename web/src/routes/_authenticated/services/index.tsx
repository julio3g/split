import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers } from '@/features/customers/hooks'
import { useProviders } from '@/features/providers/hooks'
import { useServices } from '@/features/services/hooks'
import { ServicesTable } from '@/features/services/services-table'
import { SERVICE_STATUS_LABELS, type ServiceStatus } from '@/types/api'

const ALL = '__all__'

export const Route = createFileRoute('/_authenticated/services/')({
  component: ServicesPage,
})

function ServicesPage() {
  const { data: services = [], isLoading } = useServices()
  const { data: customers = [] } = useCustomers()
  const { data: providers = [] } = useProviders()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ServiceStatus | typeof ALL>(ALL)
  const [customerId, setCustomerId] = useState(ALL)

  const customersById = new Map(customers.map(c => [c.id, c]))
  const providersById = new Map(providers.map(p => [p.id, p]))

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return services.filter(service => {
      if (status !== ALL && service.status !== status) return false
      if (customerId !== ALL && service.customerId !== customerId) return false

      if (!term) return true

      const customerName = customersById.get(service.customerId)?.name ?? ''
      return (
        String(service.number).includes(term) ||
        service.title.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term)
      )
    })
  }, [services, search, status, customerId, customersById])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Serviços</h1>
        <Button render={<Link to="/services/new" />}>Novo serviço</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por número, título ou cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={status}
          onValueChange={value => setStatus(value as ServiceStatus | typeof ALL)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            {Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={customerId}
          onValueChange={value => setCustomerId(value ?? ALL)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os clientes</SelectItem>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <ServicesTable
          services={filtered}
          customersById={customersById}
          providersById={providersById}
        />
      )}
    </div>
  )
}
