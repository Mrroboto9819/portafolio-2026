import { requireAdmin } from '../../../utils/auth'
import { resolveCollection, updateContent } from '../../../utils/content'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const slug = getRouterParam(event, 'collection')!
  const id = getRouterParam(event, 'id')!
  const name = resolveCollection(slug)
  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object' })
  }
  const item = await updateContent(name, id, body as any)
  return { item }
})
