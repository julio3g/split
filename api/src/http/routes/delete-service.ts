import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'

export const deleteServiceRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/services/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Remove um serviço e seus itens',
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      const [service] = await db
        .delete(services)
        .where(
          and(
            eq(services.id, request.params.id),
            eq(services.workspaceId, request.user.workspaceId)
          )
        )
        .returning()

      if (!service) {
        throw new NotFoundError('Serviço não encontrado!')
      }

      return reply.status(204).send()
    }
  )
}
