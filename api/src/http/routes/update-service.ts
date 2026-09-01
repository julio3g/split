import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { withServiceTotals } from '../../lib/calc'
import { NotFoundError } from '../../lib/errors'
import { servicePublicSchema } from '../schemas'

export const updateServiceRoute: FastifyPluginAsyncZod = async app => {
  app.put(
    '/services/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Atualiza os dados de um serviço (sem alterar os itens)',
        params: z.object({ id: z.string() }),
        body: z.object({
          customerId: z.string().optional(),
          providerId: z.string().optional(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          dueDate: z.string().optional(),
        }),
        response: {
          200: servicePublicSchema,
        },
      },
    },
    async request => {
      const [updated] = await db
        .update(services)
        .set({ ...request.body, updatedAt: new Date() })
        .where(eq(services.id, request.params.id))
        .returning()

      if (!updated) {
        throw new NotFoundError('Serviço não encontrado!')
      }

      const service = await db.query.services.findFirst({
        where: eq(services.id, updated.id),
        with: { items: true },
      })

      if (!service) {
        throw new NotFoundError('Serviço não encontrado!')
      }

      return withServiceTotals(service)
    }
  )
}
