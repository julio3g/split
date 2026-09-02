import { relations } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../../lib/id'
import { users } from './users'

export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'member'])

export const workspaces = pgTable('workspaces', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('wsp')),
  name: text('name').notNull(),
  inviteCode: text('invite_code')
    .notNull()
    .unique()
    .$defaultFn(() => generateId({ length: 16, separator: '' })),
  ownerId: text('owner_id')
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  nextServiceNumber: integer('next_service_number').notNull().default(1),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
    role: workspaceRoleEnum('role').notNull().default('member'),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  table => [primaryKey({ columns: [table.workspaceId, table.userId] })]
)

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
}))

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}))
