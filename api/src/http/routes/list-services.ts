import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
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
    async () => {
      const rows = await db.query.services.findMany({
        with: { items: true },
        orderBy: (s, { desc }) => desc(s.number),
      })

      return rows.map(withServiceTotals)
    }
  )
}
