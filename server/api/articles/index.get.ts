import { prisma } from '#prisma'
import { articlesQuerySchema } from '#server/validation'
import { buildSkip, buildPageMeta } from '#server/pagination'

export default defineEventHandler(async (event) => {
  const result = articlesQuerySchema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid query parameters' })
  }

  const { page, limit } = result.data
  const published = { publishedAt: { not: null, lte: new Date() } } as const

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: published,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip: buildSkip(page, limit),
      take: limit,
    }),
    prisma.article.count({ where: published }),
  ])

  return {
    data: articles,
    meta: buildPageMeta(total, page, limit),
  }
})
