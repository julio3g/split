import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MaskInput, type MaskPattern } from '@/components/ui/mask-input'

export const providerFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
  email: z.union([z.email('E-mail inválido'), z.literal('')]).optional(),
  notes: z.string().optional(),
})

export type ProviderFormData = z.infer<typeof providerFormSchema>

type ProviderFormProps = {
  defaultValues?: ProviderFormData
  onSubmit: (data: ProviderFormData) => void
  isPending?: boolean
  submitLabel?: string
}

export const phone8Pattern: MaskPattern = {
  pattern: '(##) ####-####',
  transform: value => value.replace(/\D/g, '').slice(0, 10),
  validate: value => value.replace(/\D/g, '').length === 10,
}

export const phone9Pattern: MaskPattern = {
  pattern: '(##) #####-####',
  transform: value => value.replace(/\D/g, '').slice(0, 11),
  validate: value => value.replace(/\D/g, '').length === 11,
}

export function ProviderForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = 'Salvar',
}: ProviderFormProps) {
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: defaultValues ?? { name: '', phone: '', email: '', notes: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome <span className='text-red-500'>*</span></FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            const rawValue = String(field.value ?? '')
            const digits = rawValue.replace(/\D/g, '')
            const isMobile = digits.length >= 3 ? digits[2] === '9' : false
            const mask =
              isMobile || digits.length > 10 ? phone9Pattern : phone8Pattern

            return (
              <FormItem>
                <FormLabel htmlFor="phone">Telefone</FormLabel>
                <MaskInput
                  id="phone"
                  mask={mask}
                  value={rawValue}
                  onValueChange={(_, unmasked) => field.onChange(unmasked ?? '')}
                />
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
