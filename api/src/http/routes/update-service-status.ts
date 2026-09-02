import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'

const serviceStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'delivered',
  'cancelled',
])

export const updateServiceStatusRoute: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/services/:id/status',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Altera o status de um serviço',
        params: z.object({ id: z.string() }),
        body: z.object({ status: serviceStatusSchema }),
      },
    },
    async request => {
      const [service] = await db
        .update(services)
        .set({ status: request.body.status, updatedAt: new Date() })
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

      return service
    }
  )
}
