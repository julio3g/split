import { createFileRoute, Link } from '@tanstack/react-router'

import { LoginForm } from '@/features/auth/login-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <LoginForm />
      <p className="text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link to="/register" className="font-medium text-foreground hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
