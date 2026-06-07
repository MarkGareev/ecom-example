import { prisma } from '#prisma'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'refresh_token')

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { tokenHash: token } })
  }

  deleteCookie(event, 'refresh_token', { path: '/' })

  return { success: true }
})
