import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users, workspaceMembers, workspaces } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { ConflictError, NotFoundError } from '../../lib/errors'
import { getMembershipWithWorkspace } from '../../lib/workspace'
import { workspacePublicSchema } from '../schemas'

export const joinWorkspaceRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/workspaces/join',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Entra numa workspace via código de convite e troca pra ela',
        body: z.object({
          inviteCode: z.string().min(1),
        }),
        response: {
          200: workspacePublicSchema,
        },
      },
    },
    async (request, reply) => {
      const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.inviteCode, request.body.inviteCode),
      })

      if (!workspace) {
        throw new NotFoundError('Convite inválido!')
      }

      const existingMembership = await getMembershipWithWorkspace(
        request.user.id,
        workspace.id
      )

      if (!existingMembership) {
        try {
          await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId: request.user.id,
            role: 'member',
          })
        } catch {
          throw new ConflictError('Não foi possível entrar na workspace!')
        }
      }

      await db
        .update(users)
        .set({ activeWorkspaceId: workspace.id })
        .where(eq(users.id, request.user.id))

      const token = await signSession({
        sub: request.user.id,
        email: request.user.email,
        workspaceId: workspace.id,
        workspaceRole: existingMembership?.role ?? 'member',
      })
      setSessionCookie(reply, token)

      return {
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
        role: existingMembership?.role ?? 'member',
      }
    }
  )
}
