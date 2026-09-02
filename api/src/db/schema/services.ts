import { relations } from 'drizzle-orm'
import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { generateId } from '../../lib/id'
import { customers } from './customers'
import { providers } from './providers'
import { serviceItems } from './service-items'
import { workspaces } from './workspaces'

export const serviceStatusEnum = pgEnum('service_status', [
  'pending',
  'in_progress',
  'completed',
  'delivered',
  'cancelled',
])

export const services = pgTable('services', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('svc')),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'restrict' }),
  providerId: text('provider_id').references(() => providers.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  status: serviceStatusEnum('status').notNull().default('pending'),
  dueDate: date('due_date'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const servicesRelations = relations(services, ({ one, many }) => ({
  customer: one(customers, {
    fields: [services.customerId],
    references: [customers.id],
  }),
  provider: one(providers, {
    fields: [services.providerId],
    references: [providers.id],
  }),
  items: many(serviceItems),
}))
