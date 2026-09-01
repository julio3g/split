import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CustomerForm,
  type CustomerFormData,
} from '@/features/customers/customer-form'
import {
  useCustomer,
  useDeleteCustomer,
  useUpdateCustomer,
} from '@/features/customers/hooks'
import { useServices } from '@/features/services/hooks'
import { ServicesTable } from '@/features/services/services-table'
import { useProviders } from '@/features/providers/hooks'
import { cleanOptionalStrings } from '@/lib/form-utils'

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
  component: CustomerDetailPage,
})

function CustomerDetailPage() {
  const { customerId } = Route.useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomer(customerId)
  const { data: services = [] } = useServices()
  const { data: providers = [] } = useProviders()
  const updateCustomer = useUpdateCustomer(customerId)
  const deleteCustomer = useDeleteCustomer()
  const [editing, setEditing] = useState(false)

  if (isLoading || !customer) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  function handleUpdate(data: CustomerFormData) {
    updateCustomer.mutate(cleanOptionalStrings(data), {
      onSuccess: () => {
        toast.success('Cliente atualizado.')
        setEditing(false)
      },
      onError: error => toast.error(error.message),
    })
  }

  function handleDelete() {
    deleteCustomer.mutate(customerId, {
      onSuccess: () => {
        toast.success('Cliente excluído.')
        navigate({ to: '/customers' })
      },
      onError: error => toast.error(error.message),
    })
  }

  const customerServices = services.filter(s => s.customerId === customerId)
  const customersById = new Map([[customer.id, customer]])
  const providersById = new Map(providers.map(p => [p.id, p]))

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">{customer.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(v => !v)}>
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              Excluir
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Clientes com serviços
                  vinculados não podem ser excluídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardContent>
            <CustomerForm
              defaultValues={{
                name: customer.name,
                phone: customer.phone ?? '',
                email: customer.email ?? '',
                notes: customer.notes ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updateCustomer.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Telefone:</span>{' '}
              {customer.phone || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">E-mail:</span>{' '}
              {customer.email || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Observações:</span>{' '}
              {customer.notes || '—'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-medium">Serviços</h2>
        <ServicesTable
          services={customerServices}
          customersById={customersById}
          providersById={providersById}
        />
      </div>
    </div>
  )
}
