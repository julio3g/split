import chalk from 'chalk'
import { eq } from 'drizzle-orm'
import { db, pool } from './client'
import { hashValue } from '../lib/hash'
import { users } from './schema'

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@split.local',
  password: 'admin123456',
}

const existing = await db.query.users.findFirst({
  where: eq(users.username, DEFAULT_ADMIN.username),
})

if (existing) {
  console.log(chalk.yellow(`✔ Usuário "${DEFAULT_ADMIN.username}" já existe.`))
} else {
  const passwordHash = await hashValue(DEFAULT_ADMIN.password)

  await db.insert(users).values({
    username: DEFAULT_ADMIN.username,
    email: DEFAULT_ADMIN.email,
    passwordHash,
  })

  console.log(chalk.green(`✔ Usuário "${DEFAULT_ADMIN.username}" criado.`))
  console.log(chalk.gray(`  email: ${DEFAULT_ADMIN.email}`))
  console.log(chalk.gray(`  senha: ${DEFAULT_ADMIN.password}`))
}

await pool.end()
