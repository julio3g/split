import { Link } from '@tanstack/react-router'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer, Provider, Service } from '@/types/api'
import { StatusBadge } from './status-badge'

type ServicesTableProps = {
  services: Service[]
  customersById: Map<string, Customer>
  providersById: Map<string, Provider>
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ServicesTable({
  services,
  customersById,
  providersById,
}: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum serviço encontrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Prestador</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Venda</TableHead>
          <TableHead className="text-right">Repasse</TableHead>
          <TableHead className="text-right">Margem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map(service => (
          <TableRow key={service.id}>
            <TableCell>
              <Link
                to="/services/$serviceId"
                params={{ serviceId: service.id }}
                className="font-medium hover:underline"
              >
                #{service.number}
              </Link>
            </TableCell>
            <TableCell>
              {customersById.get(service.customerId)?.name ?? '—'}
            </TableCell>
            <TableCell>{service.title}</TableCell>
            <TableCell>
              {service.providerId
                ? (providersById.get(service.providerId)?.name ?? '—')
                : '—'}
            </TableCell>
            <TableCell>
              <StatusBadge status={service.status} />
            </TableCell>
            <TableCell className="text-right">
              {currencyFormatter.format(service.saleAmount)}
            </TableCell>
            <TableCell className="text-right">
              {currencyFormatter.format(service.providerAmount)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {currencyFormatter.format(service.margin)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
