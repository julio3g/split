import { sql } from 'drizzle-orm'
import { afterAll, afterEach } from 'vitest'
import { db, pool } from '../src/db/client'

afterEach(async () => {
  await db.execute(
    sql`TRUNCATE TABLE service_items, services, providers, customers, users RESTART IDENTITY CASCADE`
  )
})

afterAll(async () => {
  await pool.end()
})
