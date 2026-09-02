import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { NotFoundError, UnauthorizedError } from '../../lib/errors'
import { getMembershipWithWorkspace } from '../../lib/workspace'
import { userPublicSchema } from '../schemas'

export const getAuthenticatedUserRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/user',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['auth'],
        summary: 'Retorna os dados do usuário autenticado',
        response: {
          200: userPublicSchema,
        },
      },
    },
    async request => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, request.user.id),
      })

      if (!user) {
        throw new NotFoundError('Usuário não encontrado!')
      }

      const membership = await getMembershipWithWorkspace(
        user.id,
        request.user.workspaceId
      )

      if (!membership) {
        throw new UnauthorizedError('Sessão inválida ou expirada!')
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          role: membership.role,
        },
      }
    }
  )
}
