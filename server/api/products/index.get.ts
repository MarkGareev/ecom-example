import { prisma } from '#prisma'
import { productsQuerySchema } from '#server/validation'
import { buildProductsWhere, buildPageMeta } from '#server/products'

export default defineEventHandler(async (event) => {
  const query = productsQuerySchema.parse(getQuery(event))
  const { page, limit, sort, order } = query
  const skip = (page - 1) * limit
  const where = buildProductsWhere(query)

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
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    meta: buildPageMeta(total, page, limit),
  }
})
