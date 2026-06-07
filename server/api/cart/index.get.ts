import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discount: true,
          imageUrl: true,
          stock: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  })

  return items
})
