import { jwtVerify, SignJWT } from 'jose'
import { env } from '../env'

const secret = new TextEncoder().encode(env.JWT_SECRET)
const EXPIRES_IN = '7d'

export type SessionPayload = {
  sub: string
  email: string
  workspaceId: string
  workspaceRole: 'owner' | 'member'
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret)
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as SessionPayload
}
