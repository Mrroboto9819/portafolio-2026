import type { H3Event } from 'h3'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  maxRequests: number
  windowMs: number
}

const RATE_LIMIT_STATE = '__admin_rate_limit_state__'

function getState(): Map<string, RateLimitEntry> {
  const globalScope = globalThis as typeof globalThis & {
    [RATE_LIMIT_STATE]?: Map<string, RateLimitEntry>
  }

  if (!globalScope[RATE_LIMIT_STATE]) {
    globalScope[RATE_LIMIT_STATE] = new Map<string, RateLimitEntry>()
  }

  return globalScope[RATE_LIMIT_STATE]!
}

function resolveClientIp(event: H3Event): string {
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = getHeader(event, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  return event.node.req.socket.remoteAddress || 'unknown'
}

export function enforceRateLimit(event: H3Event, options: RateLimitOptions): void {
  const maxRequests = Math.max(1, Math.floor(options.maxRequests))
  const windowMs = Math.max(1000, Math.floor(options.windowMs))
  const now = Date.now()
  const ip = resolveClientIp(event)
  const bucketKey = `${options.key}:${ip}`
  const state = getState()
  const current = state.get(bucketKey)

  if (!current || current.resetAt <= now) {
    state.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    })
    return
  }

  if (current.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Try again later.',
    })
  }

  current.count += 1
  state.set(bucketKey, current)
}
