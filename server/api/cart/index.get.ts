import { prisma } from '#prisma'
import { cartGetSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { userId } = cartGetSchema.parse(getQuery(event))

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
