import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerFieldProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Selecione uma data',
}: DatePickerFieldProps) {
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start font-normal',
              !selected && 'text-muted-foreground'
            )}
          />
        }
      >
        <CalendarIcon className="size-4" />
        {selected ? format(selected, 'dd/MM/yyyy') : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          onSelect={date => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        />
      </PopoverContent>
    </Popover>
  )
}
