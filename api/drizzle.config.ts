import type { Config } from 'drizzle-kit'
import { env } from './src/env'

export default {
  schema: './src/db/schema',
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config
