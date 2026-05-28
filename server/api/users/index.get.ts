import { prisma } from '#prisma'

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  return users
})
