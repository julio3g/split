import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronsUpDownIcon, PlusIcon, SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useMe } from '@/features/auth/hooks'
import { useCreateWorkspace, useSwitchWorkspace, useWorkspaces } from './hooks'

export function WorkspaceSwitcher() {
  const { data: user } = useMe()
  const { data: workspaces } = useWorkspaces()
  const switchWorkspace = useSwitchWorkspace()
  const createWorkspace = useCreateWorkspace()
  const navigate = useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  function handleSwitch(id: string) {
    if (id === user?.workspace.id) return

    switchWorkspace.mutate(id, {
      onSuccess: () => navigate({ to: '/' }),
      onError: error => toast.error(error.message),
    })
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()

    createWorkspace.mutate(newWorkspaceName, {
      onSuccess: () => {
        setDialogOpen(false)
        setNewWorkspaceName('')
        navigate({ to: '/' })
      },
      onError: error => toast.error(error.message),
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="gap-1.5" />}
        >
          {user?.workspace.name ?? '...'}
          <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces?.map(workspace => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSwitch(workspace.id)}
                className={
                  workspace.id === user?.workspace.id
                    ? 'bg-muted text-foreground'
                    : undefined
                }
              >
                {workspace.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <PlusIcon className="size-4" />
            Criar workspace
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link to="/workspace" />}>
            <SettingsIcon className="size-4" />
            Configurações da workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              autoFocus
              placeholder="Nome da workspace"
              value={newWorkspaceName}
              onChange={event => setNewWorkspaceName(event.target.value)}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
              >
                {createWorkspace.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
