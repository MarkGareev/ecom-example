import type { H3Event } from 'h3'
import type { AccessTokenPayload } from '#server/jwt'

export function requireAuth(event: H3Event): AccessTokenPayload {
  const user = event.context.user as AccessTokenPayload | undefined
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return user
}
