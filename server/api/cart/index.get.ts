import { prisma } from '#prisma'
import { cartGetSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = cartGetSchema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' })
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: result.data.userId },
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
