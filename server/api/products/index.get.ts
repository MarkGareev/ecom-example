import { prisma } from '#prisma'
import type { Prisma } from '#db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const skip = (page - 1) * limit

  const sortField = String(query.sort || 'createdAt')
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc'
  const allowedSorts = ['price', 'createdAt', 'name']
  const orderBy = allowedSorts.includes(sortField)
    ? { [sortField]: sortOrder }
    : { createdAt: 'desc' as const }

  const where: Prisma.ProductWhereInput = {}

  if (query.category) {
    where.category = { slug: String(query.category) }
  }

  if (query.sale === 'true') {
    where.discount = { gt: 0 }
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {}
    if (query.minPrice) where.price = { ...where.price, gte: Number(query.minPrice) }
    if (query.maxPrice) where.price = { ...where.price, lte: Number(query.maxPrice) }
  }

  if (query.search) {
    where.name = { contains: String(query.search), mode: 'insensitive' }
  }

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
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
})
