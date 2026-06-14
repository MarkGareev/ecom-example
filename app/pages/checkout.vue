<template>
  <div class="container_narrow checkout-page">
    <nav class="breadcrumbs">
      <NuxtLink to="/cart">Cart</NuxtLink>
      <span>→</span>
      <span>Checkout</span>
    </nav>
    <h1 class="h1 checkout-page__title">Checkout</h1>

    <div class="checkout-layout">
      <div class="checkout-form">
        <div class="step-card">
          <div class="step-card__num">1</div>
          <div class="step-card__body">
            <p class="step-card__title">Contact Details</p>
            <div class="step-card__fields">
              <AppInput id="name" v-model="form.name" label="Full Name" placeholder="John Smith" />
              <AppInput
                id="phone"
                v-model="form.phone"
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
              />
              <AppInput
                id="email"
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-card__num">2</div>
          <div class="step-card__body">
            <p class="step-card__title">Delivery</p>
            <div class="delivery-options">
              <label
                v-for="opt in deliveryOptions"
                :key="opt.value"
                class="delivery-opt"
                :class="{ 'delivery-opt_active': form.delivery === opt.value }"
              >
                <span class="radio" :class="{ radio_active: form.delivery === opt.value }">
                  <span class="radio__dot" />
                </span>
                <input v-model="form.delivery" :value="opt.value" type="radio" class="sr-only" />
                <span class="delivery-opt__info">
                  <span class="delivery-opt__name">{{ opt.name }}</span>
                  <span class="delivery-opt__note">{{ opt.note }}</span>
                </span>
              </label>
            </div>
            <div class="step-card__fields" style="margin-top: 16px">
              <AppInput
                id="address"
                v-model="form.address"
                label="Delivery Address"
                placeholder="123 Main St, New York, NY"
              />
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-card__num">3</div>
          <div class="step-card__body">
            <p class="step-card__title">Payment</p>
            <div class="delivery-options">
              <label
                v-for="opt in paymentOptions"
                :key="opt.value"
                class="delivery-opt"
                :class="{ 'delivery-opt_active': form.payment === opt.value }"
              >
                <span class="radio" :class="{ radio_active: form.payment === opt.value }">
                  <span class="radio__dot" />
                </span>
                <input v-model="form.payment" :value="opt.value" type="radio" class="sr-only" />
                <span class="delivery-opt__info">
                  <span class="delivery-opt__name">{{ opt.name }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="order-summary">
        <p class="order-summary__title">Your Order</p>
        <div class="order-summary__items">
          <div v-for="item in cart.items" :key="item.id" class="order-item">
            <div class="order-item__image">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
              <div v-else class="order-item__placeholder" />
              <span class="order-item__qty">{{ item.quantity }}</span>
            </div>
            <span class="order-item__name">{{ item.name }}</span>
            <span class="order-item__price">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>
        <div class="order-summary__rows">
          <div class="order-summary__row">
            <span>Items</span>
            <span>{{ formatPrice(cart.subtotal) }}</span>
          </div>
        </div>
        <div class="order-summary__divider" />
        <div class="order-summary__total">
          <span>Total</span>
          <span class="order-summary__total-val">
            {{ formatPrice(cart.total) }}
          </span>
        </div>
        <AppButton full size="lg" :disabled="submitting" @click="submit">
          {{ submitting ? 'Placing order…' : 'Place Order' }}
        </AppButton>
        <p class="order-summary__disclaimer">
          By placing your order, you agree to our privacy policy and terms of service
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppInput from '~/shared/ui/AppInput.vue'
  import AppButton from '~/shared/ui/AppButton.vue'
  import { useCartStore } from '~/entities/cart/model/cart.store'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { formatPrice } from '~/shared/lib'

  const cart = useCartStore()
  const auth = useAuthStore()
  const router = useRouter()

  const submitting = ref(false)

  const form = reactive({
    name: '',
    phone: '',
    email: '',
    delivery: 'courier',
    address: '',
    payment: 'card',
  })

  const deliveryOptions = [
    { value: 'courier', name: 'Courier', note: 'Delivery in 1–2 days' },
    { value: 'pickup_point', name: 'Pickup Point', note: 'Nearest location' },
    { value: 'self', name: 'Self Pickup', note: 'From our store' },
  ]

  const paymentOptions = [
    { value: 'card', name: 'Pay by Card' },
    { value: 'cash', name: 'Pay on Delivery' },
  ]

  async function submit() {
    if (!form.address.trim()) return
    submitting.value = true
    try {
      await auth.api.orders.create({
        address: form.address,
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      })
      cart.clear()
      router.push('/')
    } catch {
      // TODO: show error
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .checkout-page {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__title {
      margin-bottom: $sp-8;
      margin-top: $sp-3;
    }
  }

  .breadcrumbs {
    align-items: center;
    color: $color-ink-subtle;
    display: flex;
    font-size: $font-size-sm;
    gap: $sp-2;

    a {
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }
  }

  .checkout-layout {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: $sp-6;
  }

  .checkout-form {
    display: flex;
    flex: 3 1 420px;
    flex-direction: column;
    gap: $sp-4;
  }

  .step-card {
    background-color: $color-surface;
    border-radius: $radius-xl;
    display: flex;
    gap: $sp-5;
    padding: $sp-6;

    &__num {
      @include square(26px);
      @include flex-center;

      background-color: $color-dark;
      border-radius: $radius-full;
      color: #fff;
      flex-shrink: 0;
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      margin-top: 2px;
    }

    &__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: $sp-4;
      min-width: 0;
    }

    &__title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
    }

    &__fields {
      display: grid;
      gap: $sp-3;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
  }

  .delivery-options {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }

  .delivery-opt {
    align-items: center;
    background-color: $color-surface;
    border: 1.5px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    display: flex;
    gap: $sp-3;
    padding: $sp-3 $sp-4;
    transition:
      border-color $transition-fast,
      background-color $transition-fast;

    &_active {
      background-color: #fbf4f0;
      border-color: $color-accent;
    }

    &__info {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
    }

    &__name {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
    }

    &__note {
      color: $color-ink-muted;
      font-size: $font-size-xs;
    }

    &__price {
      color: $color-ink;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
    }
  }

  .radio {
    @include square(18px);
    @include flex-center;

    border: 1.5px solid $color-border;
    border-radius: $radius-full;
    flex-shrink: 0;
    transition:
      border-color $transition-fast,
      background-color $transition-fast;

    &__dot {
      @include square(8px);

      background-color: transparent;
      border-radius: $radius-full;
      transition: background-color $transition-fast;
    }

    &_active {
      border-color: $color-accent;

      .radio__dot {
        background-color: $color-accent;
      }
    }
  }

  .order-summary {
    background-color: $color-surface;
    border-radius: $radius-xl;
    display: flex;
    flex: 1 1 280px;
    flex-direction: column;
    gap: $sp-4;
    padding: $sp-6;
    position: sticky;
    top: 100px;

    &__title {
      font-size: 17px;
      font-weight: $font-weight-bold;
    }

    &__items {
      display: flex;
      flex-direction: column;
      gap: $sp-3;
    }

    &__rows {
      border-top: 1px solid $color-divider;
      display: flex;
      flex-direction: column;
      gap: $sp-3;
      padding-top: $sp-4;
    }

    &__row {
      @include flex-between;

      color: $color-ink-muted;
      font-size: $font-size-base;
    }

    &__free {
      color: $color-success;
      font-weight: $font-weight-medium;
    }

    &__divider {
      background-color: $color-divider;
      height: 1px;
    }

    &__total {
      @include flex-between;

      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
    }

    &__total-val {
      font-size: 1.5rem;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-extrabold;
    }

    &__disclaimer {
      color: $color-ink-subtle;
      font-size: $font-size-xs;
      line-height: $line-height-relaxed;
      text-align: center;
    }
  }

  .order-item {
    align-items: center;
    display: flex;
    gap: $sp-3;

    &__image {
      @include square(48px);

      border-radius: $radius-sm;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;

      img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    }

    &__placeholder {
      background: repeating-linear-gradient(
        135deg,
        #f1eae0 0,
        #f1eae0 11px,
        #ebe2d5 11px,
        #ebe2d5 22px
      );
      height: 100%;
      width: 100%;
    }

    &__qty {
      @include square(18px);
      @include flex-center;

      background-color: $color-ink;
      border-radius: $radius-full;
      bottom: -2px;
      color: #fff;
      font-size: 10px;
      font-weight: $font-weight-bold;
      position: absolute;
      right: -2px;
    }

    &__name {
      flex: 1;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      line-height: $line-height-snug;
    }

    &__price {
      flex-shrink: 0;
      font-size: $font-size-base;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-semibold;
    }
  }

  .sr-only {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
