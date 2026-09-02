import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProviders } from '@/features/providers/hooks'
import { ProvidersTable } from '@/features/providers/providers-table'

export const Route = createFileRoute('/_authenticated/providers/')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const { data: providers = [], isLoading } = useProviders()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return providers
    return providers.filter(p => p.name.toLowerCase().includes(term))
  }, [providers, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Prestadores</h1>
        <Button nativeButton={false} render={<Link to="/providers/new" />}>
          Novo prestador
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
        <ProvidersTable providers={filtered} />
      )}
    </div>
  )
}
