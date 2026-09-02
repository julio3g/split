import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { ForbiddenError } from '../../lib/errors'
import { getMembershipWithWorkspace } from '../../lib/workspace'
import { workspacePublicSchema } from '../schemas'

export const switchWorkspaceRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/workspaces/:id/switch',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Troca a workspace ativa da sessão',
        params: z.object({ id: z.string() }),
        response: {
          200: workspacePublicSchema,
        },
      },
    },
    async (request, reply) => {
      const membership = await getMembershipWithWorkspace(
        request.user.id,
        request.params.id
      )

      if (!membership) {
        throw new ForbiddenError('Você não é membro dessa workspace!')
      }

      await db
        .update(users)
        .set({ activeWorkspaceId: membership.workspace.id })
        .where(eq(users.id, request.user.id))

      const token = await signSession({
        sub: request.user.id,
        email: request.user.email,
        workspaceId: membership.workspace.id,
        workspaceRole: membership.role,
      })
      setSessionCookie(reply, token)

      return {
        id: membership.workspace.id,
        name: membership.workspace.name,
        inviteCode: membership.workspace.inviteCode,
        role: membership.role,
      }
    }
  )
}
