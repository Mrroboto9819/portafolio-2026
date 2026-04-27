import { timingSafeEqual } from 'node:crypto'
import { countAdmins, createAdmin, findUserByUsername } from '../../../utils/users'
import { enforceRateLimit } from '../../../utils/rateLimit'

type SetupBody = { username?: string; password?: string }

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

// One-time first-admin bootstrap. Refuses once any admin exists, so it can be
// left mounted in the deployment indefinitely without becoming a privilege
// escalation vector. The caller must present `Authorization: Bearer <SETUP_TOKEN>`
// matching the env var; the username/password go in the body.
export default defineEventHandler(async (event) => {
  // Tight rate limit — this endpoint should normally be hit once, ever.
  enforceRateLimit(event, {
    key: 'auth-setup',
    maxRequests: 5,
    windowMs: 60 * 1000,
  })

  const setupToken = (process.env.SETUP_TOKEN || '').trim()
  if (!setupToken) {
    throw createError({ statusCode: 503, statusMessage: 'Setup is disabled (no SETUP_TOKEN configured)' })
  }

  const header = getHeader(event, 'authorization') || ''
  const [scheme, presented] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !presented || !safeEqual(presented, setupToken)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid setup token' })
  }

  if ((await countAdmins()) > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Setup already complete — an admin user exists',
    })
  }

  const body = await readBody<SetupBody>(event)
  const username = body?.username?.trim().toLowerCase()
  const password = body?.password
  if (!username || username.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'username must be at least 3 chars' })
  }
  if (!password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'password must be at least 8 chars' })
  }

  // Defensive: race between countAdmins() and insertOne() is not realistic
  // here, but a duplicate username would 11000 the unique index — surface as 409.
  const collision = await findUserByUsername(username)
  if (collision) {
    throw createError({ statusCode: 409, statusMessage: 'Username already exists' })
  }

  const user = await createAdmin(username, password)
  return {
    ok: true,
    user: { id: user._id.toString(), username: user.username, role: user.role },
  }
})
