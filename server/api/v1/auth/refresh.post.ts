import {
  REFRESH_COOKIE,
  clearAuthCookies,
  refreshTtlSeconds,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../../utils/auth'
import { clearUserRefreshJti, findUserById, setUserRefreshJti } from '../../../utils/users'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, REFRESH_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }

  let claims
  try {
    claims = verifyRefreshToken(token)
  } catch {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }

  const user = await findUserById(claims.sub)
  if (!user) {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'User no longer exists' })
  }

  // Rotation guard: the jti on the presented refresh token must match the
  // one we last issued for this user. Anything else (replay of an older
  // refresh, or someone reusing a stolen one after a rotation) means the
  // session is compromised — nuke it and require a re-login.
  if (!user.refreshJti || user.refreshJti !== claims.jti) {
    await clearUserRefreshJti(user._id)
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Refresh token replay detected' })
  }

  const baseClaims = {
    sub: user._id.toString(),
    username: user.username,
    role: user.role,
  }
  const newAccess = signAccessToken(baseClaims)
  const { token: newRefresh, jti: newJti } = signRefreshToken(baseClaims)
  await setUserRefreshJti(user._id, newJti, new Date(Date.now() + refreshTtlSeconds() * 1000))
  setAuthCookies(event, newAccess, newRefresh)

  return {
    ok: true,
    user: { id: user._id.toString(), username: user.username, role: user.role },
    accessToken: newAccess,
  }
})
