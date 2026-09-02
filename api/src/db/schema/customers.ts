import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../../lib/id'
import { services } from './services'
import { workspaces } from './workspaces'

export const customers = pgTable('customers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('cus')),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  notes: text('notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const customersRelations = relations(customers, ({ many }) => ({
  services: many(services),
}))
