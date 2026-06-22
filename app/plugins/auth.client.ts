import { useAuthStore } from '~/shared/model/auth.store'
import { useCartStore } from '~/entities/cart/model/cart.store'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const cart = useCartStore()

  if (!auth.isAuthenticated) {
    await auth.refresh()
  }

  if (auth.isAuthenticated) {
    await cart.fetchFromServer(auth.api)
  }
})
