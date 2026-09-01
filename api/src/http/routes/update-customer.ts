import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'
import { customerPublicSchema } from '../schemas'

export const updateCustomerRoute: FastifyPluginAsyncZod = async app => {
  app.put(
    '/customers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['customers'],
        summary: 'Atualiza os dados de um cliente',
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string().min(1).optional(),
          phone: z.string().optional(),
          email: z.email().optional(),
          notes: z.string().optional(),
        }),
        response: {
          200: customerPublicSchema,
        },
      },
    },
    async request => {
      const [customer] = await db
        .update(customers)
        .set({ ...request.body, updatedAt: new Date() })
        .where(eq(customers.id, request.params.id))
        .returning()

      if (!customer) {
        throw new NotFoundError('Cliente não encontrado!')
      }

      return customer
    }
  )
}
