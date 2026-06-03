import { prisma } from '#prisma'
import { articleSlugSchema } from '#server/validation'

export default defineEventHandler(async (event) => {
  const { slug } = articleSlugSchema.parse({ slug: getRouterParam(event, 'slug') })

  const article = await prisma.article.findFirst({
    where: {
      slug,
      publishedAt: { not: null, lte: new Date() },
    },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  return article
})
