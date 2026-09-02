import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

import { RegisterForm } from '@/features/auth/register-form'

export const Route = createFileRoute('/register')({
  validateSearch: z.object({
    invite: z.string().optional(),
  }),
  component: RegisterPage,
})

function RegisterPage() {
  const { invite } = Route.useSearch()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <RegisterForm inviteCode={invite} />
      <p className="text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
