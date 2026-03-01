import { promisify } from 'node:util'
import { exec as execCallback } from 'node:child_process'
import { isAdminAuthenticated } from '../../utils/adminAuth'
import { enforceRateLimit } from '../../utils/rateLimit'

const exec = promisify(execCallback)

function trimOutput(output: string, max = 600): string {
  const value = output.trim()
  if (!value) return ''
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

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
  const command = String(config.adminSwarmRestartCommand || '').trim()

  enforceRateLimit(event, {
    key: 'admin-restart',
    maxRequests,
    windowMs: windowSeconds * 1000,
  })

  if (!command) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Restart command is not configured',
    })
  }

  try {
    const { stdout, stderr } = await exec(command, {
      timeout: 120000,
      maxBuffer: 1024 * 1024,
    })

    return {
      ok: true,
      command,
      stdout: trimOutput(stdout),
      stderr: trimOutput(stderr),
      executedAt: new Date().toISOString(),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Restart command failed'
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
