import { prisma } from '#prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = String(query.userId || '')

  if (!userId) {
    throw createError({ statusCode: 400, message: 'userId is required' })
  }

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
