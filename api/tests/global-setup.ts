import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from '../src/db/client'

export async function setup() {
  await migrate(db, { migrationsFolder: './drizzle' })
  await pool.end()
}
