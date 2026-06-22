export interface CartItem {
  cartItemId: string
  id: string
  name: string
  slug: string
  price: number
  unit: string
  imageUrl: string | null
  quantity: number
}
