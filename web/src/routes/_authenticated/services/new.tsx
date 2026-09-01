import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useCustomers } from '@/features/customers/hooks'
import { useProviders } from '@/features/providers/hooks'
import { useCreateService } from '@/features/services/hooks'
import { ServiceForm, type ServiceFormData } from '@/features/services/service-form'

export const Route = createFileRoute('/_authenticated/services/new')({
  component: NewServicePage,
})

function NewServicePage() {
  const navigate = useNavigate()
  const { data: customers = [] } = useCustomers()
  const { data: providers = [] } = useProviders()
  const createService = useCreateService()

  function handleSubmit(data: ServiceFormData) {
    createService.mutate(
      {
        customerId: data.customerId,
        providerId: data.providerId || undefined,
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate || undefined,
        items: data.items,
      },
      {
        onSuccess: service => {
          toast.success('Serviço criado.')
          navigate({ to: '/services/$serviceId', params: { serviceId: service.id } })
        },
        onError: error => toast.error(error.message),
      }
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Novo serviço</h1>
      <ServiceForm
        customers={customers}
        providers={providers}
        onSubmit={handleSubmit}
        isPending={createService.isPending}
      />
    </div>
  )
}
