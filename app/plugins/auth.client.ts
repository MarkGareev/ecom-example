import { useAuthStore } from '~/shared/model/auth.store'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    await auth.refresh()
  }
})
