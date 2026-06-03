import type { ArticlesQuery } from '#server/validation'

export function buildArticlesSkip(query: ArticlesQuery) {
  return (query.page - 1) * query.limit
}
