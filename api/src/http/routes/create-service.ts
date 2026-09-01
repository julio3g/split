import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/client'
import { serviceItems, services } from '../../db/schema'
import { withServiceTotals } from '../../lib/calc'
import { ConflictError } from '../../lib/errors'
import { servicePublicSchema } from '../schemas'

const serviceItemInputSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'), // RB05
  unitPrice: z.number().nonnegative('Valor não pode ser negativo'), // RB04
  providerUnitPrice: z.number().nonnegative('Valor não pode ser negativo'), // RB04
})

export const createServiceRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/services',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['services'],
        summary: 'Cria um novo serviço com seus itens',
        body: z.object({
          customerId: z.string(), // RB01
          providerId: z.string().optional(), // RB03
          title: z.string().min(1, 'Título é obrigatório'),
          description: z.string().optional(),
          dueDate: z.string().optional(),
          items: z
            .array(serviceItemInputSchema)
            .min(1, 'Adicione ao menos um item'), // RB02
        }),
        response: {
          201: servicePublicSchema,
        },
      },
    },
    async (request, reply) => {
      const { items, ...serviceData } = request.body

      const created = await db.transaction(async tx => {
        const [service] = await tx
          .insert(services)
          .values(serviceData)
          .returning()

        if (!service) {
          throw new ConflictError('Não foi possível criar o serviço!')
        }

        const insertedItems = await tx
          .insert(serviceItems)
          .values(
            items.map(item => ({
              serviceId: service.id,
              description: item.description,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              providerUnitPrice: item.providerUnitPrice.toString(),
            }))
          )
          .returning()

        return { ...service, items: insertedItems }
      })

      return reply.status(201).send(withServiceTotals(created))
    }
  )
}
