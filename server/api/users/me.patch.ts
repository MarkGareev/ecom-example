import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'
import { updateProfileSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const result = updateProfileSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  if (result.data.email) {
    const existing = await prisma.user.findUnique({ where: { email: result.data.email } })
    if (existing && existing.id !== userId) {
      throw createError({ statusCode: 409, message: 'Email already in use' })
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: result.data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return user
})
