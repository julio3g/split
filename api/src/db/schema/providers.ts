import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { services } from './services'
import { workspaces } from './workspaces'
import { generateId } from '../../lib/id'

export const providers = pgTable('providers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('prv')),
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

export const providersRelations = relations(providers, ({ many }) => ({
  services: many(services),
}))
