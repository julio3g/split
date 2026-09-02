import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { workspaces } from '../../db/schema'
import { ForbiddenError, NotFoundError } from '../../lib/errors'
import { workspacePublicSchema } from '../schemas'

export const updateWorkspaceRoute: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/api/workspaces/current',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Renomeia a workspace ativa (somente owner)',
        body: z.object({
          name: z.string().min(1, 'Nome é obrigatório'),
        }),
        response: {
          200: workspacePublicSchema,
        },
      },
    },
    async request => {
      if (request.user.workspaceRole !== 'owner') {
        throw new ForbiddenError('Só o owner pode renomear a workspace!')
      }

      const [workspace] = await db
        .update(workspaces)
        .set({ name: request.body.name })
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
