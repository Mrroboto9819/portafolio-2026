import { isAdminAuthenticated } from '../../utils/adminAuth'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig(event)
  const windowSeconds = Number(config.adminRateLimitWindowSeconds || 900)
  const maxRequests = Number(config.adminRestartMaxRequests || 5)

  enforceRateLimit(event, {
    key: 'admin-restart',
    maxRequests,
    windowMs: windowSeconds * 1000,
  })

  const restartedAt = new Date().toISOString()

  // Send SIGTERM after responding — exit code 143 triggers Docker restart policy.
  setTimeout(() => process.kill(process.pid, 'SIGTERM'), 500)

  return {
    ok: true,
    restartedAt,
  }
})
