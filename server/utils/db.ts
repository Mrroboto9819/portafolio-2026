import { MongoClient, type Db } from 'mongodb'

// Cached on globalThis so the singleton survives Nitro's per-request handler
// re-evaluation and HMR in dev. One pool per process is what we want.
const GLOBAL_KEY = '__portafolio_mongo__'

type CachedClient = {
  client: MongoClient
  db: Db
  ready: Promise<Db>
}

function getCache(): { value: CachedClient | null } {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: { value: CachedClient | null } }
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { value: null }
  }
  return g[GLOBAL_KEY]!
}

export async function getDb(): Promise<Db> {
  const cache = getCache()
  if (cache.value) {
    return cache.value.ready
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  const dbName = process.env.MONGODB_DB || 'portafolio'

  const client = new MongoClient(uri, {
    // Driver default is plenty; cap so a stuck Mongo doesn't pile up sockets.
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
  })

  const ready = client.connect().then(() => client.db(dbName))
  cache.value = { client, db: null as unknown as Db, ready }

  const db = await ready
  cache.value.db = db
  return db
}
