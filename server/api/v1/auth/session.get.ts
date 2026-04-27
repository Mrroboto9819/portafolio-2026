import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler((event) => {
  const claims = requireAdmin(event)
  return {
    ok: true,
    user: { id: claims.sub, username: claims.username, role: claims.role },
  }
})
