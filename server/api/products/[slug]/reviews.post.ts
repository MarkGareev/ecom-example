import { prisma } from '#prisma'
import { requireAuth } from '#server/auth'
import { productSlugSchema, reviewPostSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { sub: userId } = requireAuth(event)

  const slugResult = productSlugSchema.safeParse(getRouterParams(event))
  if (!slugResult.success) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const bodyResult = reviewPostSchema.safeParse(await readBody(event))
  if (!bodyResult.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const product = await prisma.product.findUnique({
    where: { slug: slugResult.data.slug },
    select: { id: true },
  })
  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  const existing = await prisma.review.findFirst({
    where: { userId, productId: product.id },
  })
  if (existing) {
    throw createError({ statusCode: 409, message: 'You have already reviewed this product' })
  }

  const review = await prisma.review.create({
    data: {
      userId,
      productId: product.id,
      rating: bodyResult.data.rating,
      comment: bodyResult.data.comment,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  })

  return review
})
