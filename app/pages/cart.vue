<template>
  <div class="container_narrow cart-page">
    <h1 class="cart-page__title h1">
      Cart
      <span v-if="cart.count > 0" class="cart-page__subtitle">
        {{ cart.count }}
        {{ pluralize(cart.count, ['item', 'items', 'items']) }} for
        {{ formatPrice(cart.subtotal) }}
      </span>
    </h1>

    <div v-if="cart.items.length === 0" class="cart-page__empty">
      <p>Your cart is empty</p>
      <AppButton tag="NuxtLink" to="/catalog" variant="outline"> Go to catalog </AppButton>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <div class="cart-item__image">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
            <div v-else class="cart-item__placeholder" />
          </div>
          <div class="cart-item__info">
            <NuxtLink
              :to="`/catalog/${item.categorySlug ?? '_'}/${item.slug}`"
              class="cart-item__name"
            >
              {{ item.name }}
            </NuxtLink>
            <span class="cart-item__unit-price">
              {{ formatPrice(item.price) }} / {{ item.unit }}
            </span>
          </div>
          <AppStepper
            :model-value="item.quantity"
            size="sm"
            @update:model-value="(v) => onSetQty(item, v)"
          />
          <span class="cart-item__total">
            {{ formatPrice(item.price * item.quantity) }}
          </span>
          <button
            class="cart-item__remove"
            type="button"
            aria-label="Remove"
            @click="onRemove(item)"
          >
            <Icon name="trash" filled />
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <p class="cart-summary__title">Summary</p>
        <div class="cart-summary__rows">
          <div class="cart-summary__row">
            <span>Items ({{ cart.count }})</span>
            <span>{{ formatPrice(cart.subtotal) }}</span>
          </div>
        </div>
        <div class="cart-summary__divider" />
        <div class="cart-summary__total">
          <span>Total</span>
          <span class="cart-summary__total-val">
            {{ formatPrice(cart.total) }}
          </span>
        </div>
        <AppButton full size="lg" tag="NuxtLink" to="/checkout"> Checkout </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppButton from '~/shared/ui/AppButton.vue'
  import AppStepper from '~/shared/ui/AppStepper.vue'
  import { useCartStore } from '~/entities/cart/model/cart.store'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { formatPrice, pluralize } from '~/shared/lib'
  import type { CartItem } from '~/entities/cart/model/cart.types'

  const cart = useCartStore()
  const auth = useAuthStore()

  async function onRemove(item: CartItem) {
    if (auth.isAuthenticated) {
      await cart.serverRemove(auth.api, item.cartItemId)
    } else {
      cart.localRemove(item.id)
    }
  }

  async function onSetQty(item: CartItem, qty: number) {
    if (auth.isAuthenticated) {
      await cart.serverSetQty(auth.api, item.cartItemId, qty)
    } else {
      cart.localSetQty(item.id, qty)
    }
  }
</script>

<style scoped lang="scss">
  .cart-page {
    padding-bottom: $sp-16;
    padding-top: $sp-8;

    &__title {
      align-items: baseline;
      display: flex;
      flex-wrap: wrap;
      gap: $sp-3;
      margin-bottom: $sp-8;
    }

    &__subtitle {
      color: $color-ink-muted;
      font-family: $font-body;
      font-size: $font-size-lg;
      font-weight: $font-weight-regular;
    }

    &__empty {
      align-items: center;
      display: flex;
      flex-direction: column;
      gap: $sp-6;
      padding: $sp-16 0;
      text-align: center;

      p {
        color: $color-ink-muted;
        font-size: $font-size-xl;
      }
    }
  }

  .cart-layout {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: $sp-6;
  }

  .cart-items {
    display: flex;
    flex: 3 1 420px;
    flex-direction: column;
    gap: $sp-3;
  }

  .cart-item {
    align-items: center;
    background-color: $color-surface;
    border-radius: $radius-lg;
    display: flex;
    gap: $sp-4;
    padding: $sp-4;

    &__image {
      @include square(84px);

      border-radius: $radius-md;
      flex-shrink: 0;
      overflow: hidden;

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

    &__info {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: $sp-1;
      min-width: 0;
    }

    &__name {
      @include text-clamp(2);

      color: $color-ink;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      line-height: $line-height-snug;
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }

    &__unit-price {
      color: $color-ink-muted;
      font-size: $font-size-base;
    }

    &__total {
      flex-shrink: 0;
      font-size: $font-size-xl;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-extrabold;
      min-width: 100px;
      text-align: right;

      @include respond-below(sm) {
        display: none;
      }
    }

    &__remove {
      @include square(36px);
      @include flex-center;

      border-radius: $radius-sm;
      color: $color-ink-subtle;
      flex-shrink: 0;
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }
  }

  .cart-summary {
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

    &__rows {
      display: flex;
      flex-direction: column;
      gap: $sp-3;
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

      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
    }

    &__total-val {
      font-size: 1.5rem;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-extrabold;
    }

    &__hint {
      color: $color-ink-subtle;
      font-size: $font-size-xs;
      text-align: center;
    }
  }
</style>
