import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers, providers, services } from '../../db/schema'
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
      const workspaceId = request.user.workspaceId

      if (request.body.customerId) {
        const customer = await db.query.customers.findFirst({
          where: and(
            eq(customers.id, request.body.customerId),
            eq(customers.workspaceId, workspaceId)
          ),
        })

        if (!customer) {
          throw new NotFoundError('Cliente não encontrado!')
        }
      }

      if (request.body.providerId) {
        const provider = await db.query.providers.findFirst({
          where: and(
            eq(providers.id, request.body.providerId),
            eq(providers.workspaceId, workspaceId)
          ),
        })

        if (!provider) {
          throw new NotFoundError('Prestador não encontrado!')
        }
      }

      const [updated] = await db
        .update(services)
        .set({ ...request.body, updatedAt: new Date() })
        .where(and(eq(services.id, request.params.id), eq(services.workspaceId, workspaceId)))
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
