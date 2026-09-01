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
  ProviderForm,
  type ProviderFormData,
} from '@/features/providers/provider-form'
import {
  useDeleteProvider,
  useProvider,
  useUpdateProvider,
} from '@/features/providers/hooks'
import { useCustomers } from '@/features/customers/hooks'
import { useServices } from '@/features/services/hooks'
import { ServicesTable } from '@/features/services/services-table'
import { cleanOptionalStrings } from '@/lib/form-utils'

export const Route = createFileRoute('/_authenticated/providers/$providerId')({
  component: ProviderDetailPage,
})

function ProviderDetailPage() {
  const { providerId } = Route.useParams()
  const navigate = useNavigate()
  const { data: provider, isLoading } = useProvider(providerId)
  const { data: services = [] } = useServices()
  const { data: customers = [] } = useCustomers()
  const updateProvider = useUpdateProvider(providerId)
  const deleteProvider = useDeleteProvider()
  const [editing, setEditing] = useState(false)

  if (isLoading || !provider) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  function handleUpdate(data: ProviderFormData) {
    updateProvider.mutate(cleanOptionalStrings(data), {
      onSuccess: () => {
        toast.success('Prestador atualizado.')
        setEditing(false)
      },
      onError: error => toast.error(error.message),
    })
  }

  function handleDelete() {
    deleteProvider.mutate(providerId, {
      onSuccess: () => {
        toast.success('Prestador excluído.')
        navigate({ to: '/providers' })
      },
      onError: error => toast.error(error.message),
    })
  }

  const providerServices = services.filter(s => s.providerId === providerId)
  const customersById = new Map(customers.map(c => [c.id, c]))
  const providersById = new Map([[provider.id, provider]])

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">{provider.name}</h1>
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
                <AlertDialogTitle>Excluir prestador?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Prestadores com serviços
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
            <ProviderForm
              defaultValues={{
                name: provider.name,
                phone: provider.phone ?? '',
                email: provider.email ?? '',
                notes: provider.notes ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updateProvider.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Telefone:</span>{' '}
              {provider.phone || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">E-mail:</span>{' '}
              {provider.email || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Observações:</span>{' '}
              {provider.notes || '—'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-medium">Serviços</h2>
        <ServicesTable
          services={providerServices}
          customersById={customersById}
          providersById={providersById}
        />
      </div>
    </div>
  )
}
