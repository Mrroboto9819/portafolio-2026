import {
  refreshTtlSeconds,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from '../../../utils/auth'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { findUserByUsername, setUserRefreshJti, verifyPassword } from '../../../utils/users'

type LoginBody = { username?: string; password?: string }

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const windowSeconds = Number(config.adminRateLimitWindowSeconds || 900)
  const maxAttempts = Number(config.adminLoginMaxAttempts || 10)

  enforceRateLimit(event, {
    key: 'auth-login',
    maxRequests: maxAttempts,
    windowMs: windowSeconds * 1000,
  })

  const body = await readBody<LoginBody>(event)
  const username = body?.username?.trim().toLowerCase()
  const password = body?.password
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'username and password are required' })
  }

  const user = await findUserByUsername(username)
  // Same error for unknown user vs bad password — don't leak which one.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const baseClaims = {
    sub: user._id.toString(),
    username: user.username,
    role: user.role,
  }
  const accessToken = signAccessToken(baseClaims)
  const { token: refreshToken, jti } = signRefreshToken(baseClaims)
  await setUserRefreshJti(user._id, jti, new Date(Date.now() + refreshTtlSeconds() * 1000))
  setAuthCookies(event, accessToken, refreshToken)

  return {
    ok: true,
    user: { id: user._id.toString(), username: user.username, role: user.role },
    accessToken, // also in cookie; included in body for native clients
  }
})
