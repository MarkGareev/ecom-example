import { prisma } from '#prisma'
import { articlesQuerySchema } from '#server/validation'
import { buildArticlesSkip } from '#server/articles'
import { buildPageMeta } from '#server/products'

export default defineEventHandler(async (event) => {
  const query = articlesQuerySchema.parse(getQuery(event))
  const { page, limit } = query
  const skip = buildArticlesSkip(query)
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
      skip,
      take: limit,
    }),
    prisma.article.count({ where: published }),
  ])

  return {
    data: articles,
    meta: buildPageMeta(total, page, limit),
  }
})
