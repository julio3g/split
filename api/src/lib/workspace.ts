import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users, workspaceMembers } from '../db/schema'

export type WorkspaceSummary = {
  id: string
  name: string
  role: 'owner' | 'member'
}

export async function getMembershipWithWorkspace(userId: string, workspaceId: string) {
  return db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.userId, userId),
      eq(workspaceMembers.workspaceId, workspaceId)
    ),
    with: { workspace: true },
  })
}

/**
 * Resolve qual workspace deve ficar ativa pro usuário: mantém a preferida se
 * ele ainda for membro, senão cai pra membership mais antiga. Persiste em
 * users.activeWorkspaceId quando muda.
 */
export async function resolveActiveWorkspace(
  userId: string,
  preferredWorkspaceId: string | null
): Promise<WorkspaceSummary> {
  const preferred = preferredWorkspaceId
    ? await getMembershipWithWorkspace(userId, preferredWorkspaceId)
    : null

  const resolved =
    preferred ??
    (await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, userId),
      orderBy: asc(workspaceMembers.joinedAt),
      with: { workspace: true },
    }))

  if (!resolved) {
    throw new Error('Usuário sem nenhuma workspace.')
  }

  if (resolved.workspaceId !== preferredWorkspaceId) {
    await db
      .update(users)
      .set({ activeWorkspaceId: resolved.workspaceId })
      .where(eq(users.id, userId))
  }

  return {
    id: resolved.workspace.id,
    name: resolved.workspace.name,
    role: resolved.role,
  }
}
