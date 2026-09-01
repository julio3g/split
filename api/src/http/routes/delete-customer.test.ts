import { describe, expect, it } from 'vitest'
import { createTestCustomer, createTestUser } from '../../../tests/helpers'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { buildApp } from '../app'

describe('DELETE /customers/:id', () => {
  it('remove um cliente sem servicos vinculados', async () => {
    const app = buildApp()
    const { cookieHeader } = await createTestUser()
    const customer = await createTestCustomer()

    const response = await app.inject({
      method: 'DELETE',
      url: `/customers/${customer.id}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(204)
  })

  it('RB10: bloqueia exclusao de cliente com servico vinculado', async () => {
    const app = buildApp()
    const { cookieHeader } = await createTestUser()
    const customer = await createTestCustomer()

    await db.insert(services).values({
      customerId: customer.id,
      title: 'Servico vinculado',
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/customers/${customer.id}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(409)
  })
})
