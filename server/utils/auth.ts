import jwt, { type JwtPayload } from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

// Two-token JWT scheme:
//   - Access token  ("public"):  10 min,  Authorization: Bearer <token> OR
//                                short-lived `pf_access` cookie for SSR fetches.
//   - Refresh token ("private"): 3 h,    httpOnly cookie `pf_refresh`. Rotated
//                                on every /auth/refresh call to limit replay
//                                if a refresh token is ever leaked.
//
// Both signed with separate secrets — leaking one secret never lets an attacker
// mint the other type of token.

export const ACCESS_COOKIE = 'pf_access'
export const REFRESH_COOKIE = 'pf_refresh'

export type AuthRole = 'admin'

export type AuthClaims = {
  sub: string         // user id (Mongo ObjectId as string)
  username: string
  role: AuthRole
  jti: string         // unique token id (refresh token rotation)
}

function int(env: string | undefined, fallback: number): number {
  const n = Number.parseInt(env ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function accessTtlSeconds(): number {
  return int(process.env.JWT_ACCESS_TTL_SECONDS, 600)
}

export function refreshTtlSeconds(): number {
  return int(process.env.JWT_REFRESH_TTL_SECONDS, 10800)
}

function accessSecret(): string {
  const s = process.env.JWT_ACCESS_SECRET
  if (!s || s.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'JWT_ACCESS_SECRET not configured' })
  }
  return s
}

function refreshSecret(): string {
  const s = process.env.JWT_REFRESH_SECRET
  if (!s || s.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'JWT_REFRESH_SECRET not configured' })
  }
  return s
}

export function signAccessToken(claims: Omit<AuthClaims, 'jti'>): string {
  return jwt.sign({ ...claims, jti: randomUUID() }, accessSecret(), {
    expiresIn: accessTtlSeconds(),
  })
}

export function signRefreshToken(claims: Omit<AuthClaims, 'jti'>): { token: string; jti: string } {
  const jti = randomUUID()
  const token = jwt.sign({ ...claims, jti }, refreshSecret(), {
    expiresIn: refreshTtlSeconds(),
  })
  return { token, jti }
}

export function verifyAccessToken(token: string): AuthClaims {
  return jwt.verify(token, accessSecret()) as AuthClaims & JwtPayload
}

export function verifyRefreshToken(token: string): AuthClaims {
  return jwt.verify(token, refreshSecret()) as AuthClaims & JwtPayload
}

function cookieOpts(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string): void {
  // Access cookie also httpOnly — the SPA either reads it via /auth/session
  // or relies on it being sent automatically with same-origin fetches. We do
  // not put the access token in JS-readable storage to limit XSS blast radius.
  setCookie(event, ACCESS_COOKIE, accessToken, cookieOpts(accessTtlSeconds()))
  setCookie(event, REFRESH_COOKIE, refreshToken, cookieOpts(refreshTtlSeconds()))
}

export function clearAuthCookies(event: H3Event): void {
  deleteCookie(event, ACCESS_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_COOKIE, { path: '/' })
}

function readBearer(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header) return null
  const [scheme, token] = header.split(' ')
  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

export function getAccessClaims(event: H3Event): AuthClaims | null {
  const token = readBearer(event) ?? getCookie(event, ACCESS_COOKIE)
  if (!token) return null
  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

export function requireAdmin(event: H3Event): AuthClaims {
  const claims = getAccessClaims(event)
  if (!claims || claims.role !== 'admin') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return claims
}
