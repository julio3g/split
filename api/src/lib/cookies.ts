import type { FastifyReply } from 'fastify'
import { env } from '../env'

export const SESSION_COOKIE = env.COOKIE_NAME

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS_MS / 1000,
  })
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, { path: '/' })
}
