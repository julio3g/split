import { describe, expect, it } from 'vitest'
import { createTestUser } from '../../../tests/helpers'
import { buildApp } from '../app'

describe('GET /api/user', () => {
  it('retorna o usuário autenticado via cookie', async () => {
    const app = buildApp()
    const { user, cookieHeader } = await createTestUser()

    const response = await app.inject({
      method: 'GET',
      url: '/api/user',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id: user.id, username: user.username })
  })

  it('rejeita requisição sem cookie de sessão', async () => {
    const app = buildApp()

    const response = await app.inject({ method: 'GET', url: '/api/user' })

    expect(response.statusCode).toBe(401)
  })
})
