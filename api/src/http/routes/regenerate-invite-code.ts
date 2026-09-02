import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../db/client'
import { workspaces } from '../../db/schema'
import { ForbiddenError, NotFoundError } from '../../lib/errors'
import { generateId } from '../../lib/id'
import { workspacePublicSchema } from '../schemas'

export const regenerateInviteCodeRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/workspaces/current/invite-code/regenerate',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Gera um novo código de convite pra workspace ativa (somente owner)',
        response: {
          200: workspacePublicSchema,
        },
      },
    },
    async request => {
      if (request.user.workspaceRole !== 'owner') {
        throw new ForbiddenError('Só o owner pode gerar um novo convite!')
      }

      const [workspace] = await db
        .update(workspaces)
        .set({ inviteCode: generateId({ length: 16, separator: '' }) })
        .where(eq(workspaces.id, request.user.workspaceId))
        .returning()

      if (!workspace) {
        throw new NotFoundError('Workspace não encontrada!')
      }

      return {
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
        role: 'owner' as const,
      }
    }
  )
}
