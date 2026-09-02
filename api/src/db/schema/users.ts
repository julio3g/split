import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { text, timestamp } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { generateId } from '../../lib/id'
import { workspaces } from './workspaces'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('usr')),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  activeWorkspaceId: text('active_workspace_id').references(
    (): AnyPgColumn => workspaces.id,
    { onDelete: 'set null' }
  ),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
