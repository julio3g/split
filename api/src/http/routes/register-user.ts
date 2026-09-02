import { eq, or } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { users, workspaceMembers, workspaces } from '../../db/schema'
import { signSession } from '../../lib/auth'
import { setSessionCookie } from '../../lib/cookies'
import { ConflictError, NotFoundError } from '../../lib/errors'
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
          inviteCode: z.string().optional(),
          workspaceName: z.string().min(1).optional(),
        }),
        response: {
          201: userPublicSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password, inviteCode, workspaceName } = request.body

      const existing = await db.query.users.findFirst({
        where: or(eq(users.username, username), eq(users.email, email)),
      })

      if (existing) {
        throw new ConflictError('Email ou usuário já cadastrados!')
      }

      const invitedWorkspace = inviteCode
        ? await db.query.workspaces.findFirst({
            where: eq(workspaces.inviteCode, inviteCode),
          })
        : null

      if (inviteCode && !invitedWorkspace) {
        throw new NotFoundError('Convite inválido!')
      }

      const passwordHash = await hashValue(password)

      const result = await db.transaction(async tx => {
        const [user] = await tx
          .insert(users)
          .values({ username, email, passwordHash })
          .returning()

        if (!user) {
          throw new ConflictError('Não foi possível criar o usuário!')
        }

        const workspace =
          invitedWorkspace ??
          (
            await tx
              .insert(workspaces)
              .values({
                name: workspaceName || `Workspace de ${username}`,
                ownerId: user.id,
              })
              .returning()
          )[0]

        if (!workspace) {
          throw new ConflictError('Não foi possível criar a workspace!')
        }

        await tx.insert(workspaceMembers).values({
          workspaceId: workspace.id,
          userId: user.id,
          role: invitedWorkspace ? 'member' : 'owner',
        })

        await tx
          .update(users)
          .set({ activeWorkspaceId: workspace.id })
          .where(eq(users.id, user.id))

        return { user, workspace }
      })

      const { user, workspace } = result

      const token = await signSession({
        sub: user.id,
        email: user.email,
        workspaceId: workspace.id,
        workspaceRole: invitedWorkspace ? 'member' : 'owner',
      })
      setSessionCookie(reply, token)

      return reply.status(201).send({
        id: user.id,
        username: user.username,
        email: user.email,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          role: invitedWorkspace ? 'member' : 'owner',
        },
      })
    }
  )
}
