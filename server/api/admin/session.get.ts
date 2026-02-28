import { isAdminAuthenticated } from '../../utils/adminAuth'

export default defineEventHandler((event) => {
  if (!isAdminAuthenticated(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return { ok: true }
})
