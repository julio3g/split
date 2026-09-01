import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'
import { customerPublicSchema } from '../schemas'

export const getCustomerRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/customers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['customers'],
        summary: 'Retorna um cliente pelo id',
        params: z.object({ id: z.string() }),
        response: {
          200: customerPublicSchema,
        },
      },
    },
    async request => {
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, request.params.id),
      })

      if (!customer) {
        throw new NotFoundError('Cliente não encontrado!')
      }

      return customer
    }
  )
}
