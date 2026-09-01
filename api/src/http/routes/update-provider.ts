import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { providers } from '../../db/schema'
import { NotFoundError } from '../../lib/errors'
import { providerPublicSchema } from '../schemas'

export const updateProviderRoute: FastifyPluginAsyncZod = async app => {
  app.put(
    '/providers/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['providers'],
        summary: 'Atualiza os dados de um prestador',
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string().min(1).optional(),
          phone: z.string().optional(),
          email: z.email().optional(),
          notes: z.string().optional(),
        }),
        response: {
          200: providerPublicSchema,
        },
      },
    },
    async request => {
      const [provider] = await db
        .update(providers)
        .set({ ...request.body, updatedAt: new Date() })
        .where(eq(providers.id, request.params.id))
        .returning()

      if (!provider) {
        throw new NotFoundError('Prestador não encontrado!')
      }

      return provider
    }
  )
}
