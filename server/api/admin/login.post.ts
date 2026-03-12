import { setAdminSessionCookie } from '../../utils/adminAuth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { getAdminPasswordSecret } from '../../utils/secrets'

type LoginBody = {
  password?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const windowSeconds = Number(config.adminRateLimitWindowSeconds || 900)
  const maxAttempts = Number(config.adminLoginMaxAttempts || 10)
  const expectedPassword = getAdminPasswordSecret()

  enforceRateLimit(event, {
    key: 'admin-login',
    maxRequests: maxAttempts,
    windowMs: windowSeconds * 1000,
  })

  if (!expectedPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ADMIN_PASSWORD is not configured on server',
    })
  }

  const body = await readBody<LoginBody>(event)
  const providedPassword = body?.password?.trim()

  if (!providedPassword || providedPassword !== expectedPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid password',
    })
  }

  setAdminSessionCookie(event)

  return {
    ok: true,
    expiresInSeconds: Number(config.adminSessionTtlSeconds || 900),
  }
})
