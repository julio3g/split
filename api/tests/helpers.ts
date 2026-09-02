import { db } from '../src/db/client'
import { customers, providers, users, workspaceMembers, workspaces } from '../src/db/schema'
import { signSession } from '../src/lib/auth'
import { SESSION_COOKIE } from '../src/lib/cookies'
import { hashValue } from '../src/lib/hash'

export async function createTestWorkspace(
  ownerId: string,
  overrides: Partial<Omit<typeof workspaces.$inferInsert, 'ownerId'>> = {}
) {
  const [workspace] = await db
    .insert(workspaces)
    .values({ name: 'Workspace de teste', ownerId, ...overrides })
    .returning()

  if (!workspace) throw new Error('Failed to create test workspace')

  return workspace
}

export async function createTestUser(
  overrides: Partial<typeof users.$inferInsert> = {}
) {
  const passwordHash = await hashValue('password123')

  const [user] = await db
    .insert(users)
    .values({
      username: `user-${Math.random().toString(36).slice(2, 8)}`,
      email: `${Math.random().toString(36).slice(2, 8)}@example.com`,
      passwordHash,
      ...overrides,
    })
    .returning()

  if (!user) throw new Error('Failed to create test user')

  const workspace = await createTestWorkspace(user.id)

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: 'owner',
  })

  const token = await signSession({
    sub: user.id,
    email: user.email,
    workspaceId: workspace.id,
    workspaceRole: 'owner',
  })

  return { user, workspace, token, cookieHeader: `${SESSION_COOKIE}=${token}` }
}

export async function createTestCustomer(
  workspaceId: string,
  overrides: Partial<Omit<typeof customers.$inferInsert, 'workspaceId'>> = {}
) {
  const [customer] = await db
    .insert(customers)
    .values({ name: 'Maria Silva', workspaceId, ...overrides })
    .returning()

  if (!customer) throw new Error('Failed to create test customer')

  return customer
}

export async function createTestProvider(
  workspaceId: string,
  overrides: Partial<Omit<typeof providers.$inferInsert, 'workspaceId'>> = {}
) {
  const [provider] = await db
    .insert(providers)
    .values({ name: 'Ana', workspaceId, ...overrides })
    .returning()

  if (!provider) throw new Error('Failed to create test provider')

  return provider
}
