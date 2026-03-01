import { readFileSync } from 'node:fs'

const SWARM_ADMIN_PASSWORD_PATH = '/run/secrets/portafolio_ADMIN_PASSWORD'

let cachedAdminPassword: string | null = null

function readAdminPasswordFromSwarmSecret(): string {
  return readFileSync(SWARM_ADMIN_PASSWORD_PATH, 'utf8').trim()
}

export function getAdminPasswordSecret(): string {
  if (cachedAdminPassword !== null) {
    return cachedAdminPassword
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      cachedAdminPassword = readAdminPasswordFromSwarmSecret()
      return cachedAdminPassword
    } catch {
      cachedAdminPassword = (process.env.ADMIN_PASSWORD || '').trim()
      return cachedAdminPassword
    }
  }

  cachedAdminPassword = (process.env.ADMIN_PASSWORD || '').trim()
  return cachedAdminPassword
}
