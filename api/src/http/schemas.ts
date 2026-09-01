import { z } from 'zod'

export const userPublicSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
})

export const customerPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const providerPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const serviceItemPublicSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  providerUnitPrice: z.number(),
})

export const servicePublicSchema = z.object({
  id: z.string(),
  number: z.number(),
  customerId: z.string(),
  providerId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum([
    'pending',
    'in_progress',
    'completed',
    'delivered',
    'cancelled',
  ]),
  dueDate: z.string().nullable(),
  items: z.array(serviceItemPublicSchema),
  saleAmount: z.number(),
  providerAmount: z.number(),
  margin: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const errorResponseSchema = z.object({
  message: z.string(),
})
