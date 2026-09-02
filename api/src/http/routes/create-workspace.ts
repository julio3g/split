import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users, workspaceMembers, workspaces } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { ConflictError } from '../../lib/errors'
import { workspacePublicSchema } from '../schemas'

export const createWorkspaceRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/api/workspaces',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['workspaces'],
        summary: 'Cria uma nova workspace e troca a sessão pra ela',
        body: z.object({
          name: z.string().min(1, 'Nome é obrigatório'),
        }),
        response: {
          201: workspacePublicSchema,
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body

      const workspace = await db.transaction(async tx => {
        const [workspace] = await tx
          .insert(workspaces)
          .values({ name, ownerId: request.user.id })
          .returning()

        if (!workspace) {
          throw new ConflictError('Não foi possível criar a workspace!')
        }

        await tx.insert(workspaceMembers).values({
          workspaceId: workspace.id,
          userId: request.user.id,
          role: 'owner',
        })

        await tx
          .update(users)
          .set({ activeWorkspaceId: workspace.id })
          .where(eq(users.id, request.user.id))

        return workspace
      })

      const token = await signSession({
        sub: request.user.id,
        email: request.user.email,
        workspaceId: workspace.id,
        workspaceRole: 'owner',
      })
      setSessionCookie(reply, token)

      return reply.status(201).send({
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
        role: 'owner',
      })
    }
  )
}
