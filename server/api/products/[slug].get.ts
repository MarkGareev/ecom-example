import { prisma } from '#prisma'
import { productSlugSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = productSlugSchema.safeParse(getRouterParams(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const product = await prisma.product.findUnique({
    where: { slug: result.data.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      discount: true,
      stock: true,
      imageUrl: true,
      createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null

  return { ...product, avgRating }
})
