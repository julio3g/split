import { eq, or } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { ConflictError } from '../../lib/errors'
import { hashValue } from '../../lib/hash'
import { userPublicSchema } from '../schemas'

export const registerUserRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/register',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        tags: ['auth'],
        summary: 'Cria uma nova conta de usuário',
        body: z.object({
          username: z.string().min(2),
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          201: userPublicSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password } = request.body

      const existing = await db.query.users.findFirst({
        where: or(eq(users.username, username), eq(users.email, email)),
      })

      if (existing) {
        throw new ConflictError('Email ou usuário já cadastrados!')
      }

      const passwordHash = await hashValue(password)

      const [user] = await db
        .insert(users)
        .values({ username, email, passwordHash })
        .returning()

      if (!user) {
        throw new ConflictError('Não foi possível criar o usuário!')
      }

      const token = await signSession({ sub: user.id, email: user.email })
      setSessionCookie(reply, token)

      return reply.status(201).send({
        id: user.id,
        username: user.username,
        email: user.email,
      })
    }
  )
}
