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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCustomer, useCustomers } from '@/features/customers/hooks'
import { useProvider, useProviders } from '@/features/providers/hooks'
import {
  EditServiceDetailsForm,
  type EditServiceDetailsData,
} from '@/features/services/edit-service-details-form'
import {
  useDeleteService,
  useService,
  useUpdateService,
  useUpdateServiceStatus,
} from '@/features/services/hooks'
import { StatusBadge } from '@/features/services/status-badge'
import { SERVICE_STATUS_LABELS, type ServiceStatus } from '@/types/api'

export const Route = createFileRoute('/_authenticated/services/$serviceId')({
  component: ServiceDetailPage,
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function ServiceDetailPage() {
  const { serviceId } = Route.useParams()
  const navigate = useNavigate()
  const { data: service, isLoading } = useService(serviceId)
  const { data: customers = [] } = useCustomers()
  const { data: providers = [] } = useProviders()
  const { data: customer } = useCustomer(service?.customerId ?? '')
  const { data: provider } = useProvider(service?.providerId ?? '')
  const updateService = useUpdateService(serviceId)
  const updateStatus = useUpdateServiceStatus(serviceId)
  const deleteService = useDeleteService()
  const [editing, setEditing] = useState(false)

  if (isLoading || !service) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  function handleUpdate(data: EditServiceDetailsData) {
    updateService.mutate(
      {
        customerId: data.customerId,
        providerId: data.providerId || undefined,
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Serviço atualizado.')
          setEditing(false)
        },
        onError: error => toast.error(error.message),
      }
    )
  }

  function handleStatusChange(status: ServiceStatus | null) {
    if (!status) return
    updateStatus.mutate(status, {
      onSuccess: () => toast.success('Status atualizado.'),
      onError: error => toast.error(error.message),
    })
  }

  function handleDelete() {
    deleteService.mutate(serviceId, {
      onSuccess: () => {
        toast.success('Serviço excluído.')
        navigate({ to: '/services' })
      },
      onError: error => toast.error(error.message),
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Serviço #{service.number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {service.dueDate
              ? `Prazo: ${new Date(service.dueDate).toLocaleDateString('pt-BR')}`
              : 'Sem prazo definido'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={service.status}
            onValueChange={handleStatusChange}
            items={SERVICE_STATUS_LABELS}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setEditing(v => !v)}>
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              Excluir
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação remove o serviço e todos os itens vinculados. Não
                  pode ser desfeita.
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
            <EditServiceDetailsForm
              customers={customers}
              providers={providers}
              defaultValues={{
                customerId: service.customerId,
                providerId: service.providerId ?? '',
                title: service.title,
                description: service.description ?? '',
                dueDate: service.dueDate ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updateService.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">Cliente</p>
                <p>{customer?.name ?? '—'}</p>
                <p className="text-muted-foreground">{customer?.phone || '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">Prestador</p>
                <p>{provider?.name ?? 'Não definido'}</p>
                <p className="text-muted-foreground">{provider?.phone || '—'}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">{service.title}</p>
                <StatusBadge status={service.status} />
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-medium">Itens</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right">Repasse</TableHead>
              <TableHead className="text-right">Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {currencyFormatter.format(item.quantity * item.unitPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {currencyFormatter.format(
                    item.quantity * item.providerUnitPrice
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {currencyFormatter.format(
                    item.quantity * (item.unitPrice - item.providerUnitPrice)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor cobrado</p>
            <p className="text-lg font-medium">
              {currencyFormatter.format(service.saleAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor de repasse</p>
            <p className="text-lg font-medium">
              {currencyFormatter.format(service.providerAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Margem estimada</p>
            <p className="text-lg font-medium">
              {currencyFormatter.format(service.margin)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
