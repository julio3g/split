import { relations, sql } from 'drizzle-orm'
import { numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { services } from './services'
import { generateId } from '@/lib/id'

export const serviceItems = pgTable('service_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId()),
  serviceId: text('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 })
    .notNull()
    .default('1'),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  providerUnitPrice: numeric('provider_unit_price', {
    precision: 12,
    scale: 2,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
})

export const serviceItemsRelations = relations(serviceItems, ({ one }) => ({
  service: one(services, {
    fields: [serviceItems.serviceId],
    references: [services.id],
  }),
}))
