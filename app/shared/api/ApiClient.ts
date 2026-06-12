import type {
  HttpMethod,
  TokenGetter,
  TokenRefresher,
  AuthUser,
  AuthResponse,
  Product,
  ProductDetail,
  ProductsQuery,
  PaginatedResponse,
  Category,
  Order,
  CartItem,
} from './types'

export class ApiClient {
  private readonly baseURL: string
  private getToken: TokenGetter = () => null
  private refreshToken: TokenRefresher = async () => null

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }

  setTokenGetter(fn: TokenGetter) {
    this.getToken = fn
  }

  setTokenRefresher(fn: TokenRefresher) {
    this.refreshToken = fn
  }

  private authHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private get<T>(endpoint: string, query?: Record<string, string | number | boolean | undefined>) {
    return this.call<T>('GET', endpoint, { query })
  }

  private post<T>(endpoint: string, body?: unknown, auth = true) {
    return this.call<T>('POST', endpoint, { body, auth })
  }

  private patch<T>(endpoint: string, body?: unknown) {
    return this.call<T>('PATCH', endpoint, { body, auth: true })
  }

  private delete<T>(endpoint: string) {
    return this.call<T>('DELETE', endpoint, { auth: true })
  }

  private async call<T>(
    method: HttpMethod,
    endpoint: string,
    options: {
      body?: unknown
      query?: Record<string, string | number | boolean | undefined>
      auth?: boolean
    } = {},
  ): Promise<T> {
    const { body, query, auth = true } = options
    const headers = auth ? this.authHeaders() : {}

    const attempt = () =>
      $fetch<T>(endpoint, {
        baseURL: this.baseURL,
        method,
        headers,
        body: body !== undefined ? body : undefined,
        query,
        credentials: 'include',
      })

    try {
      return await attempt()
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (auth && status === 401) {
        const newToken = await this.refreshToken()
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          return attempt()
        }
      }
      throw err
    }
  }

  readonly auth = {
    login: (body: { email: string; password: string }) =>
      this.post<AuthResponse>('/auth/login', body, false),

    register: (body: { email: string; password: string; name?: string }) =>
      this.post<AuthResponse>('/auth/register', body, false),

    refresh: () => this.post<{ accessToken: string }>('/auth/refresh', undefined, false),

    logout: () => this.post<{ success: true }>('/auth/logout'),
  }

  readonly users = {
    me: () => this.get<AuthUser & { createdAt: string }>('/users/me'),

    updateMe: (body: { name?: string; email?: string }) =>
      this.patch<AuthUser & { createdAt: string }>('/users/me', body),
  }

  readonly products = {
    list: (params?: ProductsQuery) =>
      this.get<PaginatedResponse<Product>>(
        '/products',
        params as Record<string, string | number | boolean | undefined>,
      ),

    get: (slug: string) => this.get<ProductDetail>(`/products/${slug}`),

    related: (slug: string) => this.get<Product[]>(`/products/${slug}/related`),
  }

  readonly categories = {
    list: () => this.get<Category[]>('/categories'),
  }

  readonly orders = {
    list: () => this.get<Order[]>('/orders'),

    create: (body: { address: string; items: { productId: string; quantity: number }[] }) =>
      this.post<Order>('/orders', body),
  }

  readonly cart = {
    list: () => this.get<CartItem[]>('/cart'),

    add: (body: { productId: string; quantity: number }) => this.post<CartItem>('/cart', body),

    update: (id: string, body: { quantity: number }) => this.patch<CartItem>(`/cart/${id}`, body),

    remove: (id: string) => this.delete<Record<string, never>>(`/cart/${id}`),
  }
}
