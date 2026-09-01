import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { providers } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'
import { providerPublicSchema } from '../schemas'

export const getProviderRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/providers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['providers'],
        summary: 'Retorna um prestador pelo id',
        params: z.object({ id: z.string() }),
        response: {
          200: providerPublicSchema,
        },
      },
    },
    async request => {
      const provider = await db.query.providers.findFirst({
        where: eq(providers.id, request.params.id),
      })

      if (!provider) {
        throw new NotFoundError('Prestador não encontrado!')
      }

      return provider
    }
  )
}
