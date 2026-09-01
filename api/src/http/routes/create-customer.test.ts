import { describe, expect, it } from 'vitest'
import { createTestUser } from '../../../tests/helpers'
import { buildApp } from '../app'

describe('POST /customers', () => {
  it('cria um cliente quando autenticado', async () => {
    const app = buildApp()
    const { cookieHeader } = await createTestUser()

    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      headers: { cookie: cookieHeader },
      payload: { name: 'Maria Silva' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ name: 'Maria Silva' })
  })

  it('rejeita requisição sem sessão', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      payload: { name: 'Maria Silva' },
    })

    expect(response.statusCode).toBe(401)
  })
})
