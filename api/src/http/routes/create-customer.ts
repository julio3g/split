import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers } from '../../db/schema'
import { ConflictError } from '../../lib/errors'
import { customerPublicSchema } from '../schemas'

export const createCustomerRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/customers',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['customers'],
        summary: 'Cadastra um novo cliente',
        body: z.object({
          name: z.string().min(1, 'Nome é obrigatório'),
          phone: z.string().optional(),
          email: z.email().optional(),
          notes: z.string().optional(),
        }),
        response: {
          201: customerPublicSchema,
        },
      },
    },
    async (request, reply) => {
      const [customer] = await db
        .insert(customers)
        .values({ ...request.body, workspaceId: request.user.workspaceId })
        .returning()

      if (!customer) {
        throw new ConflictError('Não foi possível criar o cliente!')
      }

      return reply.status(201).send(customer)
    }
  )
}
