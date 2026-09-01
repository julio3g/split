import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { UnauthorizedError } from '../../lib/errors'
import { compareValue } from '../../lib/hash'
import { userPublicSchema } from '../schemas'

export const loginRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/login',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['auth'],
        summary: 'Autentica um usuário e seta o cookie de sessão',
        body: z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        }),
        response: {
          200: userPublicSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body

      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      })

      if (!user) {
        throw new UnauthorizedError('Senha ou usuário inválidos!')
      }

      const isPasswordValid = await compareValue(password, user.passwordHash)

      if (!isPasswordValid) {
        throw new UnauthorizedError('Senha ou usuário inválidos!')
      }

      const token = await signSession({ sub: user.id, email: user.email })
      setSessionCookie(reply, token)

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    }
  )
}
