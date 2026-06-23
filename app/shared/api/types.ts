export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export type TokenGetter = () => string | null
export type TokenRefresher = () => Promise<string | null>

export interface ProductsQuery {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  category?: string
  q?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  discount: number | null
  stock: number
  imageUrl: string | null
  createdAt: string
  category: { id: string; name: string; slug: string } | null
}

export interface ProductDetail extends Product {
  description: string | null
}

export interface PageMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { id: string; name: string; slug: string; imageUrl: string | null }
}

export interface Order {
  id: string
  status: string
  total: number
  address: string
  createdAt: string
  items: OrderItem[]
}

export interface CartItem {
  id: string
  quantity: number
  product: Product
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string | null }
}

export interface ProductDetailWithReviews extends ProductDetail {
  reviews: Review[]
  avgRating: number | null
  _count: { reviews: number }
}
