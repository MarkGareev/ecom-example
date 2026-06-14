<template>
  <div class="container_narrow account-page">
    <template v-if="!auth.isAuthenticated">
      <div class="auth-tabs">
        <button
          class="auth-tabs__tab"
          :class="{ 'auth-tabs__tab_active': tab === 'login' }"
          type="button"
          @click="tab = 'login'"
        >
          Sign In
        </button>
        <button
          class="auth-tabs__tab"
          :class="{ 'auth-tabs__tab_active': tab === 'register' }"
          type="button"
          @click="tab = 'register'"
        >
          Create Account
        </button>
      </div>

      <div class="auth-card">
        <template v-if="tab === 'login'">
          <h1 class="h1 auth-card__title">Sign In</h1>
          <form class="auth-card__form" @submit.prevent="onLogin">
            <AppInput
              id="login-email"
              v-model="loginForm.email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              required
            />
            <AppInput
              id="login-password"
              v-model="loginForm.password"
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <p v-if="loginError" class="auth-card__error">{{ loginError }}</p>
            <AppButton full size="lg" :disabled="loginPending" type="submit">
              {{ loginPending ? 'Signing in…' : 'Sign In' }}
            </AppButton>
          </form>
        </template>

        <template v-else>
          <h1 class="h1 auth-card__title">Create Account</h1>
          <form class="auth-card__form" @submit.prevent="onRegister">
            <AppInput
              id="reg-name"
              v-model="registerForm.name"
              label="Full Name"
              placeholder="John Smith"
            />
            <AppInput
              id="reg-email"
              v-model="registerForm.email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              required
            />
            <AppInput
              id="reg-password"
              v-model="registerForm.password"
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <p v-if="registerError" class="auth-card__error">
              {{ registerError }}
            </p>
            <AppButton full size="lg" :disabled="registerPending" type="submit">
              {{ registerPending ? 'Creating account…' : 'Create Account' }}
            </AppButton>
          </form>
        </template>
      </div>
    </template>

    <template v-else>
      <h1 class="h1 account-page__title">My Account</h1>

      <div class="account-layout">
        <div class="profile-card">
          <div class="profile-card__avatar">
            {{ initials }}
          </div>
          <div class="profile-card__info">
            <p class="profile-card__name">{{ auth.user?.name ?? '—' }}</p>
            <p class="profile-card__email">{{ auth.user?.email }}</p>
            <span class="profile-card__role">{{ auth.user?.role }}</span>
          </div>
        </div>

        <div class="edit-card">
          <p class="edit-card__title">Edit Profile</p>
          <form class="edit-card__form" @submit.prevent="onSave">
            <AppInput
              id="profile-name"
              v-model="profileForm.name"
              label="Full Name"
              placeholder="John Smith"
            />
            <AppInput
              id="profile-email"
              v-model="profileForm.email"
              label="Email"
              type="email"
              placeholder="john@example.com"
            />
            <p v-if="saveError" class="auth-card__error">{{ saveError }}</p>
            <p v-if="saveSuccess" class="edit-card__success">Changes saved</p>
            <AppButton size="md" :disabled="savePending" type="submit">
              {{ savePending ? 'Saving…' : 'Save Changes' }}
            </AppButton>
          </form>
        </div>

        <div class="orders-card">
          <p class="orders-card__title">My Orders</p>
          <div v-if="ordersPending" class="orders-skeleton">
            <div v-for="i in 3" :key="i" class="orders-skeleton__row" />
          </div>
          <div v-else-if="orders.length === 0" class="orders-card__empty">No orders yet</div>
          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-row">
              <div class="order-row__meta">
                <span class="order-row__id">#{{ order.id.slice(0, 8) }}</span>
                <span class="order-row__date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <span class="order-row__status">{{ capitalize(order.status) }}</span>
              <span class="order-row__total">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <AppButton variant="outline" size="sm" class="account-page__logout" @click="onLogout">
        Sign Out
      </AppButton>
    </template>
  </div>
</template>

<script setup lang="ts">
  import AppInput from '~/shared/ui/AppInput.vue'
  import AppButton from '~/shared/ui/AppButton.vue'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { formatPrice, capitalize } from '~/shared/lib'

  const auth = useAuthStore()
  const router = useRouter()

  const tab = ref<'login' | 'register'>('login')

  const loginForm = reactive({ email: '', password: '' })
  const loginPending = ref(false)
  const loginError = ref('')

  async function onLogin() {
    loginError.value = ''
    loginPending.value = true
    try {
      await auth.login(loginForm)
      await loadOrders()
    } catch (err: unknown) {
      loginError.value =
        (err as { data?: { message?: string } })?.data?.message ?? 'Invalid credentials'
    } finally {
      loginPending.value = false
    }
  }

  const registerForm = reactive({ name: '', email: '', password: '' })
  const registerPending = ref(false)
  const registerError = ref('')

  async function onRegister() {
    registerError.value = ''
    registerPending.value = true
    try {
      await auth.register(registerForm)
      await loadOrders()
    } catch (err: unknown) {
      registerError.value =
        (err as { data?: { message?: string } })?.data?.message ?? 'Registration failed'
    } finally {
      registerPending.value = false
    }
  }

  const profileForm = reactive({
    name: auth.user?.name ?? '',
    email: auth.user?.email ?? '',
  })

  watch(
    () => auth.user,
    (u) => {
      if (u) {
        profileForm.name = u.name ?? ''
        profileForm.email = u.email
      }
    },
    { immediate: true },
  )

  const savePending = ref(false)
  const saveError = ref('')
  const saveSuccess = ref(false)

  async function onSave() {
    saveError.value = ''
    saveSuccess.value = false
    savePending.value = true
    try {
      await auth.api.users.updateMe(profileForm)
      await auth.fetchMe()
      saveSuccess.value = true
    } catch (err: unknown) {
      saveError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to save'
    } finally {
      savePending.value = false
    }
  }

  const {
    data: ordersData,
    pending: ordersPending,
    refresh: refreshOrders,
  } = await useAsyncData('account-orders', () => auth.api.orders.list(), {
    server: false,
    default: () => [],
  })
  const orders = computed(() => ordersData.value ?? [])

  async function loadOrders() {
    await refreshOrders()
  }

  async function onLogout() {
    await auth.logout()
    router.push('/')
  }

  const initials = computed(() => {
    const name = auth.user?.name ?? auth.user?.email ?? '?'
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
</script>

<style scoped lang="scss">
  .account-page {
    padding-bottom: $sp-16;
    padding-top: $sp-8;

    &__title {
      margin-bottom: $sp-8;
    }

    &__logout {
      margin-top: $sp-8;
    }
  }

  .auth-tabs {
    display: flex;
    gap: 0;
    margin-bottom: $sp-6;

    &__tab {
      border-bottom: 2px solid $color-border;
      color: $color-ink-muted;
      font-size: $font-size-md;
      font-weight: $font-weight-semibold;
      padding: $sp-3 $sp-6;
      transition:
        color $transition-fast,
        border-color $transition-fast;

      &_active {
        border-bottom-color: $color-accent;
        color: $color-ink;
      }
    }
  }

  .auth-card {
    background-color: $color-surface;
    border-radius: $radius-xl;
    max-width: 440px;
    padding: $sp-8;

    &__title {
      margin-bottom: $sp-6;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: $sp-4;
    }

    &__error {
      color: #c0392b;
      font-size: $font-size-base;
    }
  }

  .account-layout {
    display: flex;
    flex-direction: column;
    gap: $sp-6;
  }

  .profile-card {
    align-items: center;
    background-color: $color-surface;
    border-radius: $radius-xl;
    display: flex;
    gap: $sp-5;
    padding: $sp-6;

    &__avatar {
      @include square(64px);
      @include flex-center;

      background-color: $color-accent-bg;
      border-radius: $radius-full;
      color: $color-accent;
      flex-shrink: 0;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
    }

    &__name {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
    }

    &__email {
      color: $color-ink-muted;
      font-size: $font-size-base;
      margin-top: $sp-1;
    }

    &__role {
      background-color: $color-accent-bg;
      border-radius: $radius-sm;
      color: $color-accent-text;
      display: inline-block;
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      margin-top: $sp-2;
      padding: 2px 8px;
      text-transform: uppercase;
    }
  }

  .edit-card {
    background-color: $color-surface;
    border-radius: $radius-xl;
    padding: $sp-6;

    &__title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      margin-bottom: $sp-5;
    }

    &__form {
      display: flex;
      flex-direction: column;
      gap: $sp-4;
      max-width: 440px;
    }

    &__success {
      color: $color-success;
      font-size: $font-size-base;
    }
  }

  .orders-card {
    background-color: $color-surface;
    border-radius: $radius-xl;
    padding: $sp-6;

    &__title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      margin-bottom: $sp-5;
    }

    &__loading,
    &__empty {
      color: $color-ink-muted;
      font-size: $font-size-base;
      padding: $sp-4 0;
      text-align: center;
    }
  }

  .orders-list {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }

  .orders-skeleton {
    display: flex;
    flex-direction: column;
    gap: $sp-2;

    &__row {
      animation: shimmer 1.4s infinite;
      background: linear-gradient(
        90deg,
        $color-border-light 25%,
        $color-divider 50%,
        $color-border-light 75%
      );
      background-size: 200% 100%;
      border-radius: $radius-sm;
      height: 52px;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  .order-row {
    align-items: center;
    border-bottom: 1px solid $color-border-light;
    display: flex;
    gap: $sp-4;
    padding-block: $sp-3;

    &:last-child {
      border-bottom: none;
    }

    &__meta {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
    }

    &__id {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
    }

    &__date {
      color: $color-ink-muted;
      font-size: $font-size-base;
    }

    &__status {
      background-color: $color-surface-soft;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink-muted;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      padding: 2px 8px;
    }

    &__total {
      font-size: $font-size-base;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-bold;
      min-width: 80px;
      text-align: right;
    }
  }
</style>
