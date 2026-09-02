import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { workspaceMembers } from '../../db/schema'
import { workspaceMemberPublicSchema } from '../schemas'

export const listWorkspaceMembersRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/workspaces/current/members',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Lista os membros da workspace ativa',
        response: {
          200: z.array(workspaceMemberPublicSchema),
        },
      },
    },
    async request => {
      const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, request.user.workspaceId),
        with: { user: true },
      })

      return members.map(member => ({
        id: member.user.id,
        username: member.user.username,
        email: member.user.email,
        role: member.role,
      }))
    }
  )
}
