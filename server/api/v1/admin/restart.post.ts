import { requireAdmin } from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const config = useRuntimeConfig(event)
  const windowSeconds = Number(config.adminRateLimitWindowSeconds || 900)
  const maxRequests = Number(config.adminRestartMaxRequests || 5)

  enforceRateLimit(event, {
    key: 'admin-restart',
    maxRequests,
    windowMs: windowSeconds * 1000,
  })

  const restartedAt = new Date().toISOString()

  // Send SIGTERM after responding — kubelet restarts the container.
  setTimeout(() => process.kill(process.pid, 'SIGTERM'), 500)

  return { ok: true, restartedAt }
})
