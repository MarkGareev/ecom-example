import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return user
})
