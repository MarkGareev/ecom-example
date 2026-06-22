import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/entities/cart/model/cart.store'
import type { CartItem as ApiCartItem, Product } from '~/shared/api/types'

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Ceramic Mug',
  slug: 'ceramic-mug',
  price: 20,
  discount: null,
  stock: 10,
  imageUrl: null,
  createdAt: '2024-01-01',
  category: null,
  ...overrides,
})

const makeApiItem = (overrides: Partial<ApiCartItem> = {}): ApiCartItem => ({
  id: 'ci1',
  quantity: 1,
  product: makeProduct(),
  ...overrides,
})

function makeApi(items: ApiCartItem[] = []) {
  const store = [...items]
  return {
    cart: {
      list: vi.fn(async () => store),
      add: vi.fn(async (body: { productId: string; quantity: number }) => {
        const item = makeApiItem({ id: 'ci-new', quantity: body.quantity })
        store.push(item)
        return item
      }),
      update: vi.fn(async (_id: string, body: { quantity: number }) =>
        makeApiItem({ quantity: body.quantity }),
      ),
      remove: vi.fn(async () => ({}) as Record<string, never>),
    },
  }
}

describe('cart store — local (guest)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a new product', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct())
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.id).toBe('p1')
    expect(cart.items[0]!.quantity).toBe(1)
  })

  it('increments quantity when adding an existing product', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct(), 2)
    cart.localAdd(makeProduct(), 3)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.quantity).toBe(5)
  })

  it('applies discount to price', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct({ price: 100, discount: 20 }))
    expect(cart.items[0]!.price).toBe(80)
  })

  it('removes a product', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct())
    cart.localRemove('p1')
    expect(cart.items).toHaveLength(0)
  })

  it('sets quantity', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct())
    cart.localSetQty('p1', 4)
    expect(cart.items[0]!.quantity).toBe(4)
  })

  it('removes item when qty set to 0', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct())
    cart.localSetQty('p1', 0)
    expect(cart.items).toHaveLength(0)
  })

  it('computes count and subtotal correctly', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct({ id: 'p1', price: 10 }), 2)
    cart.localAdd(makeProduct({ id: 'p2', slug: 'p2', price: 15 }), 1)
    expect(cart.count).toBe(3)
    expect(cart.subtotal).toBe(35)
  })

  it('clears all items', () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct())
    cart.clear()
    expect(cart.items).toHaveLength(0)
  })
})

describe('cart store — server (authenticated)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetchFromServer populates items from API', async () => {
    const cart = useCartStore()
    const api = makeApi([makeApiItem({ id: 'ci1', quantity: 3 })])
    await cart.fetchFromServer(api)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.cartItemId).toBe('ci1')
    expect(cart.items[0]!.quantity).toBe(3)
  })

  it('fetchFromServer maps discount to final price', async () => {
    const cart = useCartStore()
    const api = makeApi([makeApiItem({ product: makeProduct({ price: 50, discount: 10 }) })])
    await cart.fetchFromServer(api)
    expect(cart.items[0]!.price).toBe(45)
  })

  it('serverAdd calls api.cart.add then refreshes list', async () => {
    const cart = useCartStore()
    const api = makeApi()
    await cart.serverAdd(api, 'p1', 2)
    expect(api.cart.add).toHaveBeenCalledWith({ productId: 'p1', quantity: 2 })
    expect(api.cart.list).toHaveBeenCalled()
  })

  it('serverRemove removes item optimistically without refetch', async () => {
    const cart = useCartStore()
    const api = makeApi([makeApiItem({ id: 'ci1' })])
    await cart.fetchFromServer(api)
    await cart.serverRemove(api, 'ci1')
    expect(api.cart.remove).toHaveBeenCalledWith('ci1')
    expect(cart.items).toHaveLength(0)
  })

  it('serverSetQty updates quantity via API', async () => {
    const cart = useCartStore()
    const api = makeApi([makeApiItem({ id: 'ci1', quantity: 1 })])
    await cart.fetchFromServer(api)
    api.cart.update.mockResolvedValueOnce(makeApiItem({ id: 'ci1', quantity: 5 }))
    await cart.serverSetQty(api, 'ci1', 5)
    expect(api.cart.update).toHaveBeenCalledWith('ci1', { quantity: 5 })
    expect(cart.items[0]!.quantity).toBe(5)
  })

  it('serverSetQty with qty 0 removes the item', async () => {
    const cart = useCartStore()
    const api = makeApi([makeApiItem({ id: 'ci1' })])
    await cart.fetchFromServer(api)
    await cart.serverSetQty(api, 'ci1', 0)
    expect(api.cart.remove).toHaveBeenCalledWith('ci1')
    expect(cart.items).toHaveLength(0)
  })

  it('mergeLocalToServer sends each local item and then fetches', async () => {
    const cart = useCartStore()
    cart.localAdd(makeProduct({ id: 'p1' }), 2)
    cart.localAdd(makeProduct({ id: 'p2', slug: 'p2' }), 1)
    const localItems = [...cart.items]
    const api = makeApi()
    await cart.mergeLocalToServer(api, localItems)
    expect(api.cart.add).toHaveBeenCalledTimes(2)
    expect(api.cart.add).toHaveBeenCalledWith({ productId: 'p1', quantity: 2 })
    expect(api.cart.add).toHaveBeenCalledWith({ productId: 'p2', quantity: 1 })
    expect(api.cart.list).toHaveBeenCalled()
  })
})
