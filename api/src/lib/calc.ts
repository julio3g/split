export type ServiceItemInput = {
  quantity: number
  unitPrice: number
  providerUnitPrice: number
}

export type ItemTotals = {
  saleTotal: number
  providerTotal: number
  margin: number
}

export type ServiceTotals = {
  saleAmount: number
  providerAmount: number
  margin: number
}

export function calcItemTotals(item: ServiceItemInput): ItemTotals {
  const saleTotal = round2(item.quantity * item.unitPrice)
  const providerTotal = round2(item.quantity * item.providerUnitPrice)
  return {
    saleTotal,
    providerTotal,
    margin: round2(saleTotal - providerTotal),
  }
}

export function calcServiceTotals(items: ServiceItemInput[]): ServiceTotals {
  const totals = items.reduce(
    (acc, item) => {
      const itemTotals = calcItemTotals(item)
      acc.saleAmount += itemTotals.saleTotal
      acc.providerAmount += itemTotals.providerTotal
      return acc
    },
    { saleAmount: 0, providerAmount: 0 }
  )

  return {
    saleAmount: round2(totals.saleAmount),
    providerAmount: round2(totals.providerAmount),
    margin: round2(totals.saleAmount - totals.providerAmount),
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export type ServiceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'delivered'
  | 'cancelled'

type RawServiceItem = {
  id: string
  serviceId: string
  description: string
  quantity: string
  unitPrice: string
  providerUnitPrice: string
}

type RawService = {
  id: string
  number: number
  customerId: string
  providerId: string | null
  title: string
  description: string | null
  status: ServiceStatus
  dueDate: string | null
  createdAt: Date
  updatedAt: Date
  items: RawServiceItem[]
}

export function withServiceTotals(service: RawService) {
  const items = service.items.map(item => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    providerUnitPrice: Number(item.providerUnitPrice),
  }))

  const totals = calcServiceTotals(items)

  return { ...service, items, ...totals }
}
