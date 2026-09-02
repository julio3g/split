import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useMe } from '@/features/auth/hooks'
import { useJoinWorkspace } from '@/features/workspaces/hooks'

export const Route = createFileRoute('/join/$inviteCode')({
  component: JoinWorkspacePage,
})

function JoinWorkspacePage() {
  const { inviteCode } = Route.useParams()
  const { data: user, isLoading, isError } = useMe()
  const joinWorkspace = useJoinWorkspace()
  const navigate = useNavigate()
  const triggered = useRef(false)

  useEffect(() => {
    if (isLoading || triggered.current) return

    if (!user) {
      if (isError) {
        navigate({ to: '/register', search: { invite: inviteCode } })
      }
      return
    }

    triggered.current = true
    joinWorkspace.mutate(inviteCode, {
      onSuccess: () => navigate({ to: '/' }),
      onError: error => {
        toast.error(error.message)
        navigate({ to: '/' })
      },
    })
  }, [isLoading, isError, user, inviteCode, joinWorkspace, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Entrando na workspace...</p>
    </div>
  )
}
