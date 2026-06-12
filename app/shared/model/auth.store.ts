import { ApiClient } from '~/shared/api/ApiClient'
import type { AuthUser, LoginPayload, RegisterPayload } from './auth.types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  const api = new ApiClient()
  api.setTokenGetter(() => accessToken.value)
  api.setTokenRefresher(refresh)

  async function login(payload: LoginPayload) {
    const res = await api.auth.login(payload)
    accessToken.value = res.accessToken
    user.value = res.user
  }

  async function register(payload: RegisterPayload) {
    const res = await api.auth.register(payload)
    accessToken.value = res.accessToken
    user.value = res.user
  }

  async function refresh(): Promise<string | null> {
    try {
      const res = await api.auth.refresh()
      accessToken.value = res.accessToken
      return res.accessToken
    } catch {
      accessToken.value = null
      user.value = null
      return null
    }
  }

  async function logout() {
    try {
      await api.auth.logout()
    } finally {
      accessToken.value = null
      user.value = null
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      const res = await api.users.me()
      user.value = res
    } catch {
      accessToken.value = null
      user.value = null
    }
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    api,
    login,
    register,
    refresh,
    logout,
    fetchMe,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
