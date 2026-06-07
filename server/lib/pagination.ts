export function buildSkip(page: number, limit: number) {
  return (page - 1) * limit
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) }
}
