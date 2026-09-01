import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import type { Service } from '@/types/api'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type SummaryCardsProps = {
  services: Service[]
}

export function SummaryCards({ services }: SummaryCardsProps) {
  const pending = services.filter(s => s.status === 'pending').length
  const inProgress = services.filter(s => s.status === 'in_progress').length
  const active = services.filter(s => s.status !== 'cancelled')

  const totalSale = active.reduce((sum, s) => sum + s.saleAmount, 0)
  const totalProvider = active.reduce((sum, s) => sum + s.providerAmount, 0)
  const totalMargin = active.reduce((sum, s) => sum + s.margin, 0)

  const now = Date.now()
  const soon = now + 7 * 24 * 60 * 60 * 1000
  const dueSoon = active.filter(
    s =>
      s.dueDate &&
      new Date(s.dueDate).getTime() >= now &&
      new Date(s.dueDate).getTime() <= soon &&
      s.status !== 'delivered'
  ).length

  const cards = [
    { label: 'Pendentes', value: pending },
    { label: 'Em andamento', value: inProgress },
    { label: 'Prazo próximo (7 dias)', value: dueSoon },
    { label: 'Total vendido', value: currencyFormatter.format(totalSale) },
    { label: 'Total de repasses', value: currencyFormatter.format(totalProvider) },
    { label: 'Margem prevista', value: currencyFormatter.format(totalMargin) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => (
        <Card key={card.label}>
          <CardContent>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl">{card.value}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
