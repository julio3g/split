import { describe, expect, it } from 'vitest'
import {
  createTestCustomer,
  createTestUser,
} from '../../../tests/helpers'
import { buildApp } from '../app'

describe('POST /services', () => {
  it('reproduz o exemplo do servico #105 do PRD (venda 250, repasse 149, margem 101)', async () => {
    const app = buildApp()
    const { cookieHeader } = await createTestUser()
    const customer = await createTestCustomer()

    const response = await app.inject({
      method: 'POST',
      url: '/services',
      headers: { cookie: cookieHeader },
      payload: {
        customerId: customer.id,
        title: 'Ajustes em peças',
        items: [
          { description: 'Barra', quantity: 3, unitPrice: 30, providerUnitPrice: 18 },
          { description: 'Ajuste de cintura', quantity: 2, unitPrice: 50, providerUnitPrice: 30 },
          { description: 'Troca de zíper', quantity: 1, unitPrice: 60, providerUnitPrice: 35 },
        ],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      saleAmount: 250,
      providerAmount: 149,
      margin: 101,
    })
  })

  it('rejeita servico sem itens (RB02)', async () => {
    const app = buildApp()
    const { cookieHeader } = await createTestUser()
    const customer = await createTestCustomer()

    const response = await app.inject({
      method: 'POST',
      url: '/services',
      headers: { cookie: cookieHeader },
      payload: { customerId: customer.id, title: 'Sem itens', items: [] },
    })

    expect(response.statusCode).toBe(400)
  })
})
