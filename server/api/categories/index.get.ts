import { prisma } from '#prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return categories
})
