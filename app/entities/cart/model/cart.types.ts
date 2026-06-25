export interface CartItem {
  cartItemId: string
  id: string
  name: string
  slug: string
  categorySlug: string | null
  price: number
  unit: string
  imageUrl: string | null
  quantity: number
}
