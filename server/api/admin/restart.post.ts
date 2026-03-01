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

  // Exit the Node.js process after responding — Docker restart policy brings it back up.
  setTimeout(() => process.exit(0), 500)

  return {
    ok: true,
    restartedAt,
  }
})
