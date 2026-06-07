import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'
import { z } from 'zod'

const schema = z.object({ id: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const result = schema.safeParse({ id: getRouterParam(event, 'id') })
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid parameters' })
  }

  const { id } = result.data

  const item = await prisma.cartItem.findUnique({ where: { id } })
  if (!item || item.userId !== userId) {
    throw createError({ statusCode: 404, message: 'Cart item not found' })
  }

  await prisma.cartItem.delete({ where: { id } })

  return { success: true }
})
