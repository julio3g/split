import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMe } from '@/features/auth/hooks'
import {
  useRegenerateInviteCode,
  useUpdateWorkspace,
  useWorkspaceMembers,
  useWorkspaces,
} from '@/features/workspaces/hooks'

export const Route = createFileRoute('/_authenticated/workspace')({
  component: WorkspaceSettingsPage,
})

function WorkspaceSettingsPage() {
  const { data: user } = useMe()
  const { data: members = [] } = useWorkspaceMembers()
  const updateWorkspace = useUpdateWorkspace()
  const regenerateInviteCode = useRegenerateInviteCode()

  const isOwner = user?.workspace.role === 'owner'
  const [name, setName] = useState(user?.workspace.name ?? '')

  function handleRename(event: React.FormEvent) {
    event.preventDefault()
    updateWorkspace.mutate(name, {
      onSuccess: () => toast.success('Workspace renomeada.'),
      onError: error => toast.error(error.message),
    })
  }

  function handleCopyInvite(code: string) {
    const link = `${window.location.origin}/join/${code}`
    navigator.clipboard.writeText(link)
    toast.success('Link de convite copiado.')
  }

  function handleRegenerate() {
    regenerateInviteCode.mutate(undefined, {
      onSuccess: () => toast.success('Novo código de convite gerado.'),
      onError: error => toast.error(error.message),
    })
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-semibold">
        Configurações da workspace
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Nome</CardTitle>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <form onSubmit={handleRename} className="flex gap-2">
              <Input value={name} onChange={event => setName(event.target.value)} />
              <Button type="submit" disabled={updateWorkspace.isPending}>
                Salvar
              </Button>
            </form>
          ) : (
            <p className="text-sm">{user.workspace.name}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Convite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Qualquer pessoa com esse link entra na workspace ao se registrar.
          </p>
          <InviteLink
            isOwner={isOwner}
            onCopy={handleCopyInvite}
            onRegenerate={handleRegenerate}
            regenerating={regenerateInviteCode.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>{member.username}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.role === 'owner' ? 'Owner' : 'Membro'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

type InviteLinkProps = {
  isOwner: boolean
  onCopy: (code: string) => void
  onRegenerate: () => void
  regenerating: boolean
}

function InviteLink({ isOwner, onCopy, onRegenerate, regenerating }: InviteLinkProps) {
  const { data: workspaces } = useWorkspaces()
  const { data: user } = useMe()
  const current = workspaces?.find(w => w.id === user?.workspace.id)

  if (!current) return null

  return (
    <div className="flex gap-2">
      <Input readOnly value={`${window.location.origin}/join/${current.inviteCode}`} />
      <Button variant="outline" onClick={() => onCopy(current.inviteCode)}>
        Copiar
      </Button>
      {isOwner && (
        <Button variant="outline" onClick={onRegenerate} disabled={regenerating}>
          Gerar novo
        </Button>
      )}
    </div>
  )
}
