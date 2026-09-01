import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { providers } from '../../db/schema'
import { isForeignKeyViolation } from '../../lib/db-errors'
import { ConflictError, NotFoundError } from '../../lib/errors'

export const deleteProviderRoute: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/providers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['providers'],
        summary: 'Remove um prestador (RB11: bloqueado se houver serviços vinculados)',
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      try {
        const [provider] = await db
          .delete(providers)
          .where(eq(providers.id, request.params.id))
          .returning()

        if (!provider) {
          throw new NotFoundError('Prestador não encontrado!')
        }

        return reply.status(204).send()
      } catch (err) {
        if (isForeignKeyViolation(err)) {
          throw new ConflictError(
            'Prestador possui serviços vinculados e não pode ser excluído.'
          )
        }
        throw err
      }
    }
  )
}
