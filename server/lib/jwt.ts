import { SignJWT, jwtVerify } from 'jose'

export interface AccessTokenPayload {
  sub: string
  email: string
  role: string
}

function getSecret(env: string) {
  const secret = process.env[env]
  if (!secret) throw new Error(`Missing env: ${env}`)
  return new TextEncoder().encode(secret)
}

export function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(getSecret('JWT_ACCESS_SECRET'))
}

export function signRefreshToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(getSecret('JWT_REFRESH_SECRET'))
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret('JWT_ACCESS_SECRET'))
  return payload as unknown as AccessTokenPayload
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret('JWT_REFRESH_SECRET'))
  return payload as { sub: string }
}
