import { prisma } from '#prisma'
import { cartPostSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { userId, productId, quantity } = cartPostSchema.parse(await readBody(event))

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity },
    create: { userId, productId, quantity },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, discount: true, imageUrl: true },
      },
    },
  })

  return item
})
