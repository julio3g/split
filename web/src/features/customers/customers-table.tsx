import { Link } from '@tanstack/react-router'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer } from '@/types/api'

type CustomersTableProps = {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum cliente cadastrado ainda.
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
        {customers.map(customer => (
          <TableRow key={customer.id}>
            <TableCell>
              <Link
                to="/customers/$customerId"
                params={{ customerId: customer.id }}
                className="font-medium hover:underline"
              >
                {customer.name}
              </Link>
            </TableCell>
            <TableCell>{customer.phone || '—'}</TableCell>
            <TableCell>{customer.email || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
