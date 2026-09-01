import { db } from '../src/db/client'
import { customers, providers, users } from '../src/db/schema'
import { signSession } from '../src/lib/auth'
import { SESSION_COOKIE } from '../src/lib/cookies'
import { hashValue } from '../src/lib/hash'

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

  const token = await signSession({ sub: user.id, email: user.email })

  return { user, token, cookieHeader: `${SESSION_COOKIE}=${token}` }
}

export async function createTestCustomer(
  overrides: Partial<typeof customers.$inferInsert> = {}
) {
  const [customer] = await db
    .insert(customers)
    .values({ name: 'Maria Silva', ...overrides })
    .returning()

  if (!customer) throw new Error('Failed to create test customer')

  return customer
}

export async function createTestProvider(
  overrides: Partial<typeof providers.$inferInsert> = {}
) {
  const [provider] = await db
    .insert(providers)
    .values({ name: 'Ana', ...overrides })
    .returning()

  if (!provider) throw new Error('Failed to create test provider')

  return provider
}
