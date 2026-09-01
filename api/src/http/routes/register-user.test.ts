import { describe, expect, it } from 'vitest'
import { createTestUser } from '../../../tests/helpers'
import { buildApp } from '../app'

describe('POST /api/register', () => {
  it('cria um usuário e seta o cookie de sessão', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: 'joana',
        email: 'joana@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      username: 'joana',
      email: 'joana@example.com',
    })
    expect(response.cookies.some(c => c.name === 'split_session')).toBe(true)
  })

  it('rejeita username ou email já cadastrados', async () => {
    const app = buildApp()
    const { user } = await createTestUser()

    const response = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: user.username,
        email: 'outro@example.com',
        password: 'password123',
      },
    })

    expect(response.statusCode).toBe(409)
  })
})
