import { prisma } from '#prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ userId: string; productId: string; quantity?: number }>(event)

  if (!body?.userId || !body?.productId) {
    throw createError({ statusCode: 400, message: 'userId and productId are required' })
  }

  const quantity = Math.max(1, Number(body.quantity) || 1)

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: body.userId, productId: body.productId } },
    update: { quantity },
    create: { userId: body.userId, productId: body.productId, quantity },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, discount: true, imageUrl: true },
      },
    },
  })

  return item
})
