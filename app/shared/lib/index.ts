export { CATEGORIES } from './categories'
export type { CategorySlug } from './categories'

export function formatPrice(val: number): string {
  return '$' + val.toLocaleString('en-US')
}

export function pluralize(n: number, forms: [string, string, string]): string {
  return n === 1 ? forms[0] : forms[1]
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
