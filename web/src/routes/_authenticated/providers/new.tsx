import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { ProviderForm, type ProviderFormData } from '@/features/providers/provider-form'
import { useCreateProvider } from '@/features/providers/hooks'
import { cleanOptionalStrings } from '@/lib/form-utils'

export const Route = createFileRoute('/_authenticated/providers/new')({
  component: NewProviderPage,
})

function NewProviderPage() {
  const navigate = useNavigate()
  const createProvider = useCreateProvider()

  function handleSubmit(data: ProviderFormData) {
    createProvider.mutate(cleanOptionalStrings(data), {
      onSuccess: provider => {
        toast.success('Prestador cadastrado.')
        navigate({ to: '/providers/$providerId', params: { providerId: provider.id } })
      },
      onError: error => toast.error(error.message),
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Novo prestador</h1>
      <ProviderForm onSubmit={handleSubmit} isPending={createProvider.isPending} />
    </div>
  )
}
