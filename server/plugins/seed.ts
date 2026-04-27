import { contentCol } from '../utils/content'
import {
  seedCompanies,
  seedCredentials,
  seedProjects,
  seedSkills,
  seedSocial,
  seedStats,
} from '../data/seed'

// Seeds public content collections from the legacy hardcoded arrays on first
// boot. Each collection is checked independently — once any document exists
// in a collection, it is left alone, so admin edits in production survive
// future deploys.
//
// Admin users are NOT seeded here — bootstrap the first admin via the
// one-time /api/v1/auth/setup endpoint (guarded by SETUP_TOKEN).

async function seedCollectionIfEmpty(name: string, items: Array<Record<string, unknown>>): Promise<void> {
  const col = await contentCol(name)
  const count = await col.estimatedDocumentCount()
  if (count > 0) return
  const now = new Date()
  const docs = items.map((item, idx) => ({
    isActive: true,
    ...item,
    order: idx,
    createdAt: now,
    updatedAt: now,
  }))
  if (docs.length === 0) return
  await col.insertMany(docs as any)
}

export default defineNitroPlugin(async () => {
  if (!process.env.MONGODB_URI) {
    // No Mongo configured (e.g. plain `bun run build` in CI). Skip silently;
    // the actual API endpoints will surface the error if hit at runtime.
    return
  }
  try {
    await seedCollectionIfEmpty('stats', seedStats as any)
    await seedCollectionIfEmpty('companies', seedCompanies as any)
    await seedCollectionIfEmpty('skills', seedSkills as any)
    await seedCollectionIfEmpty('projects', seedProjects as any)
    await seedCollectionIfEmpty('social', seedSocial as any)
    await seedCollectionIfEmpty('credentials', seedCredentials as any)
  } catch (err) {
    // Surface the failure but don't crash the pod — Mongo blips shouldn't
    // turn into a CrashLoopBackoff. Endpoints will retry on demand.
    console.error('[seed] bootstrap failed:', err)
  }
})
