import { hash, verify } from '@node-rs/argon2'
import { ObjectId, type Collection } from 'mongodb'
import { getDb } from './db'
import type { AuthRole } from './auth'

export type UserDoc = {
  _id: ObjectId
  username: string
  passwordHash: string
  role: AuthRole
  // Single active refresh token per user — logging in elsewhere bumps the
  // previous session. Sufficient for a one-admin system; multi-device would
  // need an array of jtis.
  refreshJti: string | null
  refreshExpiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export async function usersCol(): Promise<Collection<UserDoc>> {
  const db = await getDb()
  const col = db.collection<UserDoc>('users')
  await col.createIndex({ username: 1 }, { unique: true })
  return col
}

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain)
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  return verify(stored, plain)
}

export async function findUserByUsername(username: string): Promise<UserDoc | null> {
  const col = await usersCol()
  return col.findOne({ username: username.toLowerCase() })
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) return null
  const col = await usersCol()
  return col.findOne({ _id: new ObjectId(id) })
}

export async function setUserRefreshJti(userId: ObjectId, jti: string, expiresAt: Date): Promise<void> {
  const col = await usersCol()
  await col.updateOne(
    { _id: userId },
    { $set: { refreshJti: jti, refreshExpiresAt: expiresAt, updatedAt: new Date() } },
  )
}

export async function clearUserRefreshJti(userId: ObjectId): Promise<void> {
  const col = await usersCol()
  await col.updateOne(
    { _id: userId },
    { $set: { refreshJti: null, refreshExpiresAt: null, updatedAt: new Date() } },
  )
}

export async function countAdmins(): Promise<number> {
  const col = await usersCol()
  return col.countDocuments({ role: 'admin' })
}

// Creates an admin user. Used by the one-time /api/v1/auth/setup endpoint;
// callers are responsible for verifying the SETUP_TOKEN before invoking this.
export async function createAdmin(username: string, password: string): Promise<UserDoc> {
  const col = await usersCol()
  const now = new Date()
  const doc: UserDoc = {
    _id: new ObjectId(),
    username: username.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    role: 'admin',
    refreshJti: null,
    refreshExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  }
  await col.insertOne(doc)
  return doc
}
