import { ObjectId } from 'mongodb'
import { REFRESH_COOKIE, clearAuthCookies, verifyRefreshToken } from '../../../utils/auth'
import { clearUserRefreshJti } from '../../../utils/users'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, REFRESH_COOKIE)
  if (token) {
    try {
      const claims = verifyRefreshToken(token)
      if (ObjectId.isValid(claims.sub)) {
        await clearUserRefreshJti(new ObjectId(claims.sub))
      }
    } catch {
      // Token invalid/expired — cookies still get cleared below.
    }
  }
  clearAuthCookies(event)
  return { ok: true }
})
