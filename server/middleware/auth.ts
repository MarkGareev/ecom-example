import { verifyAccessToken } from '#server/jwt'

const PROTECTED_PREFIXES = ['/api/cart', '/api/orders']

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!PROTECTED_PREFIXES.some((p) => path.startsWith(p))) return

  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Missing access token' })
  }

  try {
    const payload = await verifyAccessToken(header.slice(7))
    event.context.user = payload
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired access token' })
  }
})
