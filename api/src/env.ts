import { z } from 'zod'

const nodeEnv = z
  .enum(['production', 'preview', 'development'])
  .default('development')

export type NodeEnv = z.infer<typeof nodeEnv>

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: nodeEnv,
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1),
  COOKIE_NAME: z.string().min(1).default('split_session'),
  CORS_ORIGIN: z.string().min(1).default('*'),
})

export const env = envSchema.parse(process.env)

export function isEnv(...allowed: NodeEnv[]) {
  return allowed.includes(env.NODE_ENV)
}
