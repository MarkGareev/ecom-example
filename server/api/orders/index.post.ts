import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'
import { orderPostSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const result = orderPostSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const { address, items } = result.data

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, discount: true, stock: true },
  })

  if (products.length !== productIds.length) {
    throw createError({ statusCode: 400, message: 'One or more products not found' })
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)!
    if (product.stock < item.quantity) {
      throw createError({
        statusCode: 409,
        message: `Insufficient stock for product ${item.productId}`,
      })
    }
  }

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!
    const price = product.discount
      ? product.price.toNumber() * (1 - product.discount / 100)
      : product.price.toNumber()
    return { productId: item.productId, quantity: item.quantity, price }
  })

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        address,
        total,
        items: { create: orderItems },
      },
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
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    await tx.cartItem.deleteMany({ where: { userId } })

    return created
  })

  setResponseStatus(event, 201)
  return order
})
