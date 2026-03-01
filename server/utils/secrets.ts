import { readFileSync } from 'node:fs'

const SWARM_ADMIN_PASSWORD_PATH = '/run/secrets/portafolio_ADMIN_PASSWORD'
const SWARM_RESTART_COMMAND_PATH = '/run/secrets/portafolio_ADMIN_SWARM_RESTART_COMMAND'

let cachedAdminPassword: string | null = null
let cachedSwarmRestartCommand: string | null = null

function readAdminPasswordFromSwarmSecret(): string {
  return readFileSync(SWARM_ADMIN_PASSWORD_PATH, 'utf8').trim()
}

function readSwarmRestartCommandFromSecret(): string {
  return readFileSync(SWARM_RESTART_COMMAND_PATH, 'utf8').trim()
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

export function getSwarmRestartCommandSecret(): string {
  if (cachedSwarmRestartCommand !== null) {
    return cachedSwarmRestartCommand
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      cachedSwarmRestartCommand = readSwarmRestartCommandFromSecret()
      return cachedSwarmRestartCommand
    } catch {
      cachedSwarmRestartCommand = (process.env.ADMIN_SWARM_RESTART_COMMAND || '').trim()
      return cachedSwarmRestartCommand
    }
  }

  cachedSwarmRestartCommand = (process.env.ADMIN_SWARM_RESTART_COMMAND || '').trim()
  return cachedSwarmRestartCommand
}
