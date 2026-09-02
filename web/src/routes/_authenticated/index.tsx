import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/features/dashboard/summary-cards'
import { useCustomers } from '@/features/customers/hooks'
import { useProviders } from '@/features/providers/hooks'
import { useServices } from '@/features/services/hooks'
import { ServicesTable } from '@/features/services/services-table'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: services = [] } = useServices()
  const { data: customers = [] } = useCustomers()
  const { data: providers = [] } = useProviders()

  const customersById = new Map(customers.map(c => [c.id, c]))
  const providersById = new Map(providers.map(p => [p.id, p]))
  const recent = [...services]
    .sort((a, b) => b.number - a.number)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <Button nativeButton={false} render={<Link to="/services/new" />}>
          Novo serviço
        </Button>
      </div>

      <SummaryCards services={services} />

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-medium">Serviços recentes</h2>
        <ServicesTable
          services={recent}
          customersById={customersById}
          providersById={providersById}
        />
      </div>
    </div>
  )
}
