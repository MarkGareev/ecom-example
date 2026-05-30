import { prisma } from '#prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  await prisma.cartItem.delete({ where: { id } })

  return { success: true }
})
