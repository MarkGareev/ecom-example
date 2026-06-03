import { prisma } from '#prisma'
import { cartDeleteSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { id } = cartDeleteSchema.parse({ id: getRouterParam(event, 'id') })

  await prisma.cartItem.delete({ where: { id } })

  return { success: true }
})
