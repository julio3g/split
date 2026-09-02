import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { customers } from '../../db/schema'
import { isForeignKeyViolation } from '../../lib/db-errors'
import { ConflictError, NotFoundError } from '../../lib/errors'

export const deleteCustomerRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/customers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['customers'],
        summary: 'Remove um cliente (RB10: bloqueado se houver serviços vinculados)',
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      try {
        const [customer] = await db
          .delete(customers)
          .where(
            and(
              eq(customers.id, request.params.id),
              eq(customers.workspaceId, request.user.workspaceId)
            )
          )
          .returning()

        if (!customer) {
          throw new NotFoundError('Cliente não encontrado!')
        }

        return reply.status(204).send()
      } catch (err) {
        if (isForeignKeyViolation(err)) {
          throw new ConflictError(
            'Cliente possui serviços vinculados e não pode ser excluído.'
          )
        }
        throw err
      }
    }
  )
}
