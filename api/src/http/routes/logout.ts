import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { clearSessionCookie } from '../../lib/cookies'

export const logoutRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Encerra a sessão atual, limpando o cookie',
      },
    },
    async (_request, reply) => {
      clearSessionCookie(reply)
      return reply.status(204).send()
    }
  )
}
