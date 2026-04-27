import { ObjectId, type Collection, type Document } from 'mongodb'
import { getDb } from './db'

// Shared helpers for the public-read / admin-write content collections.
// Each doc gets an `order` field used for stable sort on the landing page,
// plus createdAt/updatedAt timestamps.

// Whitelist of collection names exposed under /api/v1/[collection]. Anything
// not in this map 404s — keeps the dynamic route from being a generic Mongo
// admin surface against the user/auth collections.
export const CONTENT_COLLECTIONS = {
  stats: 'stats',
  companies: 'companies',
  skills: 'skills',
  projects: 'projects',
  social: 'social',
  credentials: 'credentials',
} as const

export type ContentSlug = keyof typeof CONTENT_COLLECTIONS

export function resolveCollection(slug: string): string {
  if (!(slug in CONTENT_COLLECTIONS)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown collection' })
  }
  return CONTENT_COLLECTIONS[slug as ContentSlug]
}

export type ContentDoc = Document & {
  _id: ObjectId
  order: number
  // Admin can deactivate without deleting — public list filters these out,
  // admin list (?all=true) returns them. Older docs without the field are
  // treated as active (the $ne filter matches missing keys).
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function contentCol<T extends ContentDoc = ContentDoc>(
  name: string,
): Promise<Collection<T>> {
  const db = await getDb()
  const col = db.collection<T>(name)
  await col.createIndex({ order: 1 })
  return col
}

export function publicShape<T extends ContentDoc>(doc: T): T & { id: string } {
  // Mongo's _id is an ObjectId; expose it as `id` string for the frontend.
  const { _id, ...rest } = doc
  return { id: _id.toString(), _id, ...rest } as T & { id: string }
}

export async function listContent<T extends ContentDoc>(
  name: string,
  opts: { activeOnly?: boolean } = {},
): Promise<Array<T & { id: string }>> {
  const col = await contentCol<T>(name)
  const filter = opts.activeOnly ? { isActive: { $ne: false } } : {}
  const docs = await col.find(filter, { sort: { order: 1, _id: 1 } }).toArray()
  return docs.map(publicShape) as Array<T & { id: string }>
}

export async function createContent<T extends ContentDoc>(
  name: string,
  body: Partial<T>,
): Promise<T & { id: string }> {
  const col = await contentCol<T>(name)
  const now = new Date()
  // If `order` not supplied, append to end.
  let order = body.order
  if (typeof order !== 'number') {
    const last = await col.find({}, { sort: { order: -1 }, limit: 1 }).toArray()
    order = last.length ? (last[0]!.order ?? 0) + 1 : 0
  }
  const doc = {
    isActive: true,
    ...body,
    _id: new ObjectId(),
    order,
    createdAt: now,
    updatedAt: now,
  } as unknown as T
  await col.insertOne(doc as any)
  return publicShape(doc) as T & { id: string }
}

export async function updateContent<T extends ContentDoc>(
  name: string,
  id: string,
  body: Partial<T>,
): Promise<T & { id: string }> {
  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const col = await contentCol<T>(name)
  // Strip immutable / server-controlled fields before update.
  const { _id, id: _ignored, createdAt, ...patch } = body as any
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return publicShape(result as T) as T & { id: string }
}

export async function deleteContent(name: string, id: string): Promise<{ ok: true }> {
  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const col = await contentCol(name)
  const result = await col.deleteOne({ _id: new ObjectId(id) })
  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return { ok: true }
}
