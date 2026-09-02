import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { CurrencyInput } from 'react-currency-mask'
import { z } from 'zod'

import { DatePickerField } from '@/components/date-picker-field'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Customer, Provider } from '@/types/api'
import { calcServiceTotals } from './calc'
import { X } from 'lucide-react'

const NO_PROVIDER = '__none__'

const serviceItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unitPrice: z.number().nonnegative('Valor não pode ser negativo'),
  providerUnitPrice: z.number().nonnegative('Valor não pode ser negativo'),
})

export const serviceFormSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  providerId: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(serviceItemSchema).min(1, 'Adicione ao menos um item'),
})

export type ServiceFormData = z.infer<typeof serviceFormSchema>

type ServiceFormProps = {
  customers: Customer[]
  providers: Provider[]
  defaultValues?: ServiceFormData
  onSubmit: (data: ServiceFormData) => void
  isPending?: boolean
  submitLabel?: string
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ServiceForm({
  customers,
  providers,
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = 'Salvar',
}: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultValues ?? {
      customerId: '',
      providerId: '',
      title: '',
      description: '',
      dueDate: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, providerUnitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const items = useWatch({ control: form.control, name: 'items' })
  const totals = calcServiceTotals(
    (items ?? []).map(item => ({
      quantity: Number(item?.quantity ?? 0),
      unitPrice: Number(item?.unitPrice ?? 0),
      providerUnitPrice: Number(item?.providerUnitPrice ?? 0),
    }))
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={Object.fromEntries(customers.map(c => [c.id, c.name]))}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="providerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestador</FormLabel>
                <Select
                  value={field.value || NO_PROVIDER}
                  onValueChange={value =>
                    field.onChange(value === NO_PROVIDER ? '' : value)
                  }
                  items={{
                    [NO_PROVIDER]: 'Sem prestador definido',
                    ...Object.fromEntries(providers.map(p => [p.id, p.name])),
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sem prestador definido" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_PROVIDER}>
                      Sem prestador definido
                    </SelectItem>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo</FormLabel>
              <FormControl>
                <DatePickerField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Itens *</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unitPrice: 0,
                  providerUnitPrice: 0,
                })
              }
            >
              Adicionar item
            </Button>
          </div>

          {form.formState.errors.items?.root?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.items.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 rounded-md items-end border p-3 sm:grid-cols-[1fr_repeat(3,7rem)_auto]"
            >
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venda unit.</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChangeValue={(_, value) => field.onChange(Number(value))}
                        InputElement={<Input />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.providerUnitPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repasse unit.</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChangeValue={(_, value) => field.onChange(Number(value))}
                        InputElement={<Input />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-md border bg-muted/30 p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total cobrado</p>
            <p className="font-medium">
              {currencyFormatter.format(totals.saleAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total de repasse</p>
            <p className="font-medium">
              {currencyFormatter.format(totals.providerAmount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Margem</p>
            <p className="font-medium">
              {currencyFormatter.format(totals.margin)}
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
