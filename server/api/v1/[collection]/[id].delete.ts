import { requireAdmin } from '../../../utils/auth'
import { deleteContent, resolveCollection } from '../../../utils/content'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const slug = getRouterParam(event, 'collection')!
  const id = getRouterParam(event, 'id')!
  const name = resolveCollection(slug)
  return deleteContent(name, id)
})
