import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { withServiceTotals } from '../../lib/calc'
import { NotFoundError } from '../../lib/errors'
import { servicePublicSchema } from '../schemas'

export const getServiceRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/services/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Retorna um serviço pelo id, com itens e totais',
        params: z.object({ id: z.string() }),
        response: {
          200: servicePublicSchema,
        },
      },
    },
    async request => {
      const service = await db.query.services.findFirst({
        where: and(
          eq(services.id, request.params.id),
          eq(services.workspaceId, request.user.workspaceId)
        ),
        with: { items: true },
      })

      if (!service) {
        throw new NotFoundError('Serviço não encontrado!')
      }

      return withServiceTotals(service)
    }
  )
}
