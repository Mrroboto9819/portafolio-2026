import { createHmac, timingSafeEqual } from 'crypto'
import type { H3Event } from 'h3'
import { getAdminPasswordSecret } from './secrets'

const ADMIN_COOKIE_NAME = 'admin_session'

function toPositiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return Math.floor(parsed)
}

function getAdminPassword(event: H3Event): string {
  void event
  return getAdminPasswordSecret()
}

function signSession(expiresAt: number, secret: string): string {
  return createHmac('sha256', secret).update(String(expiresAt)).digest('hex')
}

function getCookieOptions(event: H3Event, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export function createAdminSessionToken(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const maxAge = toPositiveNumber(config.adminSessionTtlSeconds, 900)
  const expiresAt = Date.now() + maxAge * 1000
  const signature = signSession(expiresAt, getAdminPassword(event))
  return `${expiresAt}.${signature}`
}

export function setAdminSessionCookie(event: H3Event): void {
  const config = useRuntimeConfig(event)
  const maxAge = toPositiveNumber(config.adminSessionTtlSeconds, 900)
  setCookie(event, ADMIN_COOKIE_NAME, createAdminSessionToken(event), getCookieOptions(event, maxAge))
}

export function clearAdminSessionCookie(event: H3Event): void {
  deleteCookie(event, ADMIN_COOKIE_NAME, {
    path: '/',
  })
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const token = getCookie(event, ADMIN_COOKIE_NAME)
  const secret = getAdminPassword(event)

  if (!token || !secret) {
    return false
  }

  const [expiresAtRaw, signature] = token.split('.')
  const expiresAt = Number(expiresAtRaw)

  if (!expiresAtRaw || !signature || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false
  }

  const expected = signSession(expiresAt, secret)
  if (signature.length !== expected.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
