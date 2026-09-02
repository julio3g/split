import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers } from '../../db/schema'
import { customerPublicSchema } from '../schemas'

export const listCustomersRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/customers',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['customers'],
        summary: 'Lista os clientes cadastrados',
        response: {
          200: z.array(customerPublicSchema),
        },
      },
    },
    async request => {
      return db
        .select()
        .from(customers)
        .where(eq(customers.workspaceId, request.user.workspaceId))
    }
  )
}
