import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRegister } from './hooks'

const registerSchema = z.object({
  username: z.string().min(2, 'Mínimo de 2 caracteres'),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  workspaceName: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

type RegisterFormProps = {
  inviteCode?: string
}

export function RegisterForm({ inviteCode }: RegisterFormProps) {
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', workspaceName: '' },
  })

  function onSubmit(data: RegisterFormData) {
    register.mutate(
      {
        ...data,
        workspaceName: inviteCode ? undefined : data.workspaceName || undefined,
        inviteCode,
      },
      {
        onSuccess: () => {
          navigate({ to: '/' })
        },
        onError: error => {
          toast.error(error.message)
        },
      }
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          {inviteCode
            ? 'Você vai entrar na workspace do convite.'
            : 'Cadastre-se pra começar a usar o Split.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!inviteCode && (
              <FormField
                control={form.control}
                name="workspaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da workspace</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
