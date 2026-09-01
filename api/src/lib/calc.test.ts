import { describe, expect, it } from 'vitest'
import { calcItemTotals, calcServiceTotals } from './calc'

describe('calcItemTotals', () => {
  it('calcula venda, repasse e margem de um item', () => {
    const totals = calcItemTotals({
      quantity: 3,
      unitPrice: 30,
      providerUnitPrice: 18,
    })

    expect(totals).toEqual({
      saleTotal: 90,
      providerTotal: 54,
      margin: 36,
    })
  })
})

describe('calcServiceTotals', () => {
  it('reproduz o exemplo do servico #105 do PRD', () => {
    const totals = calcServiceTotals([
      { quantity: 3, unitPrice: 30, providerUnitPrice: 18 }, // barra
      { quantity: 2, unitPrice: 50, providerUnitPrice: 30 }, // ajuste de cintura
      { quantity: 1, unitPrice: 60, providerUnitPrice: 35 }, // troca de ziper
    ])

    expect(totals).toEqual({
      saleAmount: 250,
      providerAmount: 149,
      margin: 101,
    })
  })

  it('retorna zero para lista vazia', () => {
    expect(calcServiceTotals([])).toEqual({
      saleAmount: 0,
      providerAmount: 0,
      margin: 0,
    })
  })

  it('arredonda para 2 casas decimais', () => {
    const totals = calcServiceTotals([
      { quantity: 3, unitPrice: 10.1, providerUnitPrice: 3.333 },
    ])

    expect(totals.saleAmount).toBe(30.3)
    expect(totals.providerAmount).toBe(10)
    expect(totals.margin).toBe(20.3)
  })
})
