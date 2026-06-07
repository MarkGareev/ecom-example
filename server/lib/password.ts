import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 12

export function hashPassword(plain: string) {
  return hash(plain, SALT_ROUNDS)
}

export function verifyPassword(plain: string, hashed: string) {
  return compare(plain, hashed)
}
