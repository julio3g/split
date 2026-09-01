import type { FastifyReply, FastifyRequest } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { verifySession } from '../../lib/auth'
import { SESSION_COOKIE } from '../../lib/cookies'
import { UnauthorizedError } from '../../lib/errors'

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; email: string }
  }
}

async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const token = request.cookies[SESSION_COOKIE]

  if (!token) {
    throw new UnauthorizedError('Sessão não encontrada!')
  }

  try {
    const { sub, email } = await verifySession(token)
    request.user = { id: sub, email }
  } catch {
    throw new UnauthorizedError('Sessão inválida ou expirada!')
  }
}

export const authPlugin = fastifyPlugin(async app => {
  app.decorate('authenticate', authenticate)
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate
  }
}
