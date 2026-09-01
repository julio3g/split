import { describe, expect, it } from 'vitest'
import { createTestUser } from '../../../tests/helpers'
import { buildApp } from '../app'

describe('POST /api/login', () => {
  it('autentica com credenciais válidas e seta o cookie', async () => {
    const app = buildApp()
    const { user } = await createTestUser()

    const response = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: user.username, password: 'password123' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.cookies.some(c => c.name === 'split_session')).toBe(true)
  })

  it('rejeita senha inválida', async () => {
    const app = buildApp()
    const { user } = await createTestUser()

    const response = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { username: user.username, password: 'senha-errada' },
    })

    expect(response.statusCode).toBe(401)
  })
})
