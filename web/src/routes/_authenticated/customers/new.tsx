import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { CustomerForm, type CustomerFormData } from '@/features/customers/customer-form'
import { useCreateCustomer } from '@/features/customers/hooks'
import { cleanOptionalStrings } from '@/lib/form-utils'

export const Route = createFileRoute('/_authenticated/customers/new')({
  component: NewCustomerPage,
})

function NewCustomerPage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomer()

  function handleSubmit(data: CustomerFormData) {
    createCustomer.mutate(cleanOptionalStrings(data), {
      onSuccess: customer => {
        toast.success('Cliente cadastrado.')
        navigate({ to: '/customers/$customerId', params: { customerId: customer.id } })
      },
      onError: error => toast.error(error.message),
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Novo cliente</h1>
      <CustomerForm onSubmit={handleSubmit} isPending={createCustomer.isPending} />
    </div>
  )
}
