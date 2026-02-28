import { clearAdminSessionCookie } from '../../utils/adminAuth'

export default defineEventHandler((event) => {
  clearAdminSessionCookie(event)
  return { ok: true }
})
