import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { providers } from '../../db/schema'
import { providerPublicSchema } from '../schemas'

export const listProvidersRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/providers',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['providers'],
        summary: 'Lista os prestadores cadastrados',
        response: {
          200: z.array(providerPublicSchema),
        },
      },
    },
    async () => {
      return db.select().from(providers)
    }
  )
}
