import type { CartItem } from './cart.types'
import type { CartItem as ApiCartItem, Product } from '~/shared/api/types'

function finalPrice(p: Product) {
  return p.discount ? p.price * (1 - p.discount / 100) : p.price
}

function fromProduct(product: Product, quantity = 1, cartItemId = ''): CartItem {
  return {
    cartItemId,
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.category?.slug ?? null,
    price: finalPrice(product),
    unit: 'pc.',
    imageUrl: product.imageUrl,
    quantity,
  }
}

function fromApi(item: ApiCartItem): CartItem {
  return fromProduct(item.product, item.quantity, item.id)
}

export const useCartStore = defineStore('cart-store', () => {
  const items = ref<CartItem[]>([])

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const total = computed(() => subtotal.value)

  async function fetchFromServer(api: { cart: { list: () => Promise<ApiCartItem[]> } }) {
    const serverItems = await api.cart.list()
    items.value = serverItems.map(fromApi)
  }

  async function mergeLocalToServer(
    api: {
      cart: {
        list: () => Promise<ApiCartItem[]>
        add: (body: { productId: string; quantity: number }) => Promise<ApiCartItem>
      }
    },
    localItems: CartItem[],
  ) {
    for (const local of localItems) {
      await api.cart.add({ productId: local.id, quantity: local.quantity })
    }
    await fetchFromServer(api)
  }

  async function serverAdd(
    api: {
      cart: {
        add: (body: { productId: string; quantity: number }) => Promise<ApiCartItem>
        list: () => Promise<ApiCartItem[]>
      }
    },
    productId: string,
    quantity = 1,
  ) {
    await api.cart.add({ productId, quantity })
    await fetchFromServer(api)
  }

  async function serverRemove(
    api: {
      cart: {
        remove: (id: string) => Promise<Record<string, never>>
        list: () => Promise<ApiCartItem[]>
      }
    },
    cartItemId: string,
  ) {
    await api.cart.remove(cartItemId)
    items.value = items.value.filter((i) => i.cartItemId !== cartItemId)
  }

  async function serverSetQty(
    api: {
      cart: {
        update: (id: string, body: { quantity: number }) => Promise<ApiCartItem>
        remove: (id: string) => Promise<Record<string, never>>
        list: () => Promise<ApiCartItem[]>
      }
    },
    cartItemId: string,
    qty: number,
  ) {
    if (qty <= 0) {
      await serverRemove(api, cartItemId)
      return
    }
    const updated = await api.cart.update(cartItemId, { quantity: qty })
    const item = items.value.find((i) => i.cartItemId === cartItemId)
    if (item) item.quantity = updated.quantity
  }

  function localAdd(product: Product, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push(fromProduct(product, quantity))
    }
  }

  function localRemove(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function localSetQty(id: string, qty: number) {
    if (qty <= 0) {
      localRemove(id)
      return
    }
    const item = items.value.find((i) => i.id === id)
    if (item) item.quantity = qty
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    count,
    subtotal,
    total,
    fetchFromServer,
    mergeLocalToServer,
    serverAdd,
    serverRemove,
    serverSetQty,
    localAdd,
    localRemove,
    localSetQty,
    clear,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
}
