import { Link } from '@tanstack/react-router'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Provider } from '@/types/api'

type ProvidersTableProps = {
  providers: Provider[]
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  if (providers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum prestador cadastrado ainda.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>E-mail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map(provider => (
          <TableRow key={provider.id}>
            <TableCell>
              <Link
                to="/providers/$providerId"
                params={{ providerId: provider.id }}
                className="font-medium hover:underline"
              >
                {provider.name}
              </Link>
            </TableCell>
            <TableCell>{provider.phone || '—'}</TableCell>
            <TableCell>{provider.email || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
