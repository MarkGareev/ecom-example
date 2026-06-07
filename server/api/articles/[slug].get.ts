import { prisma } from '#prisma'
import { articleSlugSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const result = articleSlugSchema.safeParse({ slug: getRouterParam(event, 'slug') })
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const article = await prisma.article.findFirst({
    where: {
      slug: result.data.slug,
      publishedAt: { not: null, lte: new Date() },
    },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  return article
})
