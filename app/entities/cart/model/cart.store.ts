import type { CartItem } from './cart.types'

export const useCartStore = defineStore('cart-store', () => {
  const items = ref<CartItem[]>([])

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const total = computed(() => subtotal.value)

  function add(product: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) {
      remove(id)
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
    add,
    remove,
    setQty,
    clear,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
}
