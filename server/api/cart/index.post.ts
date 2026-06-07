import { prisma } from '#prisma'
import { cartPostSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = cartPostSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const { userId, productId, quantity } = result.data

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, discount: true, imageUrl: true },
      },
    },
  })

  return item
})
