import { getAccessClaims } from '../../../utils/auth'
import { listContent, resolveCollection } from '../../../utils/content'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'collection')!
  const name = resolveCollection(slug)

  // Admins can opt into seeing inactive items via ?all=true. Anonymous and
  // non-admin requests get the active-only list — that's what the landing
  // page renders.
  const includeInactive = getQuery(event).all === 'true'
  if (includeInactive) {
    const claims = getAccessClaims(event)
    if (!claims || claims.role !== 'admin') {
      throw createError({ statusCode: 401, statusMessage: 'Admin auth required for ?all=true' })
    }
  }

  const items = await listContent(name, { activeOnly: !includeInactive })
  return { items }
})
