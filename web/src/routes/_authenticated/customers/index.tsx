import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCustomers } from '@/features/customers/hooks'
import { CustomersTable } from '@/features/customers/customers-table'

export const Route = createFileRoute('/_authenticated/customers/')({
  component: CustomersPage,
})

function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(c => c.name.toLowerCase().includes(term))
  }, [customers, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Clientes</h1>
        <Button nativeButton={false} render={<Link to="/customers/new" />}>
          Novo cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <CustomersTable customers={filtered} />
      )}
    </div>
  )
}
