import { prisma } from '#prisma'
import { cartDeleteSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = cartDeleteSchema.safeParse({
    id: getRouterParam(event, 'id'),
    userId: getQuery(event).userId,
  })
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid parameters' })
  }

  const { id, userId } = result.data

  const item = await prisma.cartItem.findUnique({ where: { id } })
  if (!item || item.userId !== userId) {
    throw createError({ statusCode: 404, message: 'Cart item not found' })
  }

  await prisma.cartItem.delete({ where: { id } })

  return { success: true }
})
