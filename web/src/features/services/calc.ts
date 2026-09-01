export type ServiceItemPreview = {
  quantity: number
  unitPrice: number
  providerUnitPrice: number
}

export function calcServiceTotals(items: ServiceItemPreview[]) {
  const totals = items.reduce(
    (acc, item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0
      const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0
      const providerUnitPrice = Number.isFinite(item.providerUnitPrice)
        ? item.providerUnitPrice
        : 0

      acc.saleAmount += quantity * unitPrice
      acc.providerAmount += quantity * providerUnitPrice
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

function round2(value: number) {
  return Math.round(value * 100) / 100
}
