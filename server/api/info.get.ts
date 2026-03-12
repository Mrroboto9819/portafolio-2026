import os from 'os'
import { isAdminAuthenticated } from '../utils/adminAuth'
import { enforceRateLimit } from '../utils/rateLimit'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const windowSeconds = Number(config.adminRateLimitWindowSeconds || 900)
  const maxRequests = Number(config.adminInfoMaxRequests || 120)

  enforceRateLimit(event, {
    key: 'admin-info',
    maxRequests,
    windowMs: windowSeconds * 1000,
  })

  if (!isAdminAuthenticated(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const hostname = os.hostname()

  const interfaces = os.networkInterfaces()
  let nodeIp = '-'
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (name === 'lo' || !addrs) continue
    const addr = addrs.find(a => a.family === 'IPv4')
    if (addr) {
      nodeIp = addr.address
      break
    }
  }

  return {
    hostname,
    containerId: hostname,
    nodeIp,
    timestamp: new Date().toISOString(),
  }
})
