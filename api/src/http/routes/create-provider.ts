import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { providers } from '../../db/schema'
import { ConflictError } from '../../lib/errors'
import { providerPublicSchema } from '../schemas'

export const createProviderRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/providers',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['providers'],
        summary: 'Cadastra um novo prestador',
        body: z.object({
          name: z.string().min(1, 'Nome é obrigatório'),
          phone: z.string().optional(),
          email: z.email().optional(),
          notes: z.string().optional(),
        }),
        response: {
          201: providerPublicSchema,
        },
      },
    },
    async (request, reply) => {
      const [provider] = await db
        .insert(providers)
        .values({ ...request.body, workspaceId: request.user.workspaceId })
        .returning()

      if (!provider) {
        throw new ConflictError('Não foi possível criar o prestador!')
      }

      return reply.status(201).send(provider)
    }
  )
}
