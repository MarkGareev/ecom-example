import { prisma } from '#prisma'
import { productSlugSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = productSlugSchema.safeParse(getRouterParams(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const product = await prisma.product.findUnique({
    where: { slug: result.data.slug },
    select: { id: true, categoryId: true },
  })

  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discount: true,
      imageUrl: true,
      stock: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return related
})
