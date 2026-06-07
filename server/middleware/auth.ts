import { verifyAccessToken } from '#server/jwt'

export default defineEventHandler(async (event) => {
  const header = getHeader(event, 'authorization')
  if (!header?.startsWith('Bearer ')) return

  try {
    event.context.user = await verifyAccessToken(header.slice(7))
  } catch {
    // invalid token — context.user stays undefined, requireAuth will reject
  }
})
