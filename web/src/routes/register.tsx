import { createFileRoute, Link } from '@tanstack/react-router'

import { RegisterForm } from '@/features/auth/register-form'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
