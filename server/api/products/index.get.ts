import { prisma } from '#prisma'
import { productsQuerySchema } from '#server/validation'
import { buildProductsWhere } from '#server/products'
import { buildSkip, buildPageMeta } from '#server/pagination'

export default defineEventHandler(async (event) => {
  const result = productsQuerySchema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' })
  }

  const { page, limit, sort, order } = result.data
  const where = buildProductsWhere(result.data)

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discount: true,
        stock: true,
        imageUrl: true,
        createdAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { [sort]: order },
      skip: buildSkip(page, limit),
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    meta: buildPageMeta(total, page, limit),
  }
})
