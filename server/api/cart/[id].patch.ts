import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'
import { cartPatchSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)
  const { id } = getRouterParams(event)

  const result = cartPatchSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const existing = await prisma.cartItem.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw createError({ statusCode: 404, message: 'Cart item not found' })
  }

  const item = await prisma.cartItem.update({
    where: { id },
    data: { quantity: result.data.quantity },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, discount: true, imageUrl: true },
      },
    },
  })

  return item
})
