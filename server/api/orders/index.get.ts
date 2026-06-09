import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      total: true,
      address: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
})
