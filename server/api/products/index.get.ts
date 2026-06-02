import { prisma } from '#prisma'
import { buildProductsQuery, buildPageMeta } from '#server/products'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, skip, orderBy, where } = buildProductsQuery(query)

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
      orderBy,
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
