import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { workspaceMembers } from '../../db/schema'
import { workspacePublicSchema } from '../schemas'

export const listWorkspacesRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/workspaces',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Lista as workspaces do usuário autenticado',
        response: {
          200: z.array(workspacePublicSchema),
        },
      },
    },
    async request => {
      const memberships = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, request.user.id),
        with: { workspace: true },
      })

      return memberships.map(membership => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        inviteCode: membership.workspace.inviteCode,
        role: membership.role,
      }))
    }
  )
}
