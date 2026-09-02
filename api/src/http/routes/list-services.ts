import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { services } from '../../db/schema'
import { withServiceTotals } from '../../lib/calc'
import { servicePublicSchema } from '../schemas'

export const listServicesRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/services',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Lista os serviços cadastrados',
        response: {
          200: z.array(servicePublicSchema),
        },
      },
    },
    async request => {
      const rows = await db.query.services.findMany({
        where: eq(services.workspaceId, request.user.workspaceId),
        with: { items: true },
        orderBy: (s, { desc }) => desc(s.number),
      })

      return rows.map(withServiceTotals)
    }
  )
}
