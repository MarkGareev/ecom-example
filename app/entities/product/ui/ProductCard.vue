<template>
  <NuxtLink :to="`/catalog/${product.category?.slug ?? '_'}/${product.slug}`" class="card">
    <div class="card__image">
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
      <div v-else class="card__placeholder" />
      <AppBadge v-if="product.discount" variant="dark" class="card__badge">
        −{{ product.discount }}%
      </AppBadge>
    </div>
    <div class="card__body">
      <p class="card__name">{{ product.name }}</p>
      <div class="card__footer">
        <div class="card__price">
          <span class="card__price-val">{{ formatPrice(finalPrice) }}</span>
          <span class="card__unit">pc.</span>
        </div>
        <button class="card__add" type="button" aria-label="Add to cart" @click.prevent="onAdd">
          <Icon name="plus" filled />
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
  import AppBadge from '~/shared/ui/AppBadge.vue'
  import { useCartStore } from '~/entities/cart/model/cart.store'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { formatPrice } from '~/shared/lib'
  import type { Product } from '~/shared/api/types'

  const props = defineProps<{
    product: Product
  }>()

  const cart = useCartStore()
  const auth = useAuthStore()

  const finalPrice = computed(() =>
    props.product.discount
      ? props.product.price * (1 - props.product.discount / 100)
      : props.product.price,
  )

  async function onAdd() {
    if (auth.isAuthenticated) {
      await cart.serverAdd(auth.api, props.product.id, 1)
    } else {
      cart.localAdd(props.product)
    }
  }
</script>

<style scoped lang="scss">
  .card {
    background-color: $color-surface;
    border: 1px solid $color-border-light;
    border-radius: $radius-lg;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition:
      box-shadow $transition-base,
      transform $transition-base;

    &:hover {
      box-shadow: $shadow-card;
      transform: translateY(-3px);
    }

    &__image {
      aspect-ratio: 1 / 1;
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

    &__badge {
      left: 10px;
      position: absolute;
      top: 10px;
    }

    &__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: $sp-2;
      padding: 14px 15px 15px;
    }

    &__name {
      @include text-clamp(2);

      color: $color-ink;
      font-size: 14.5px;
      font-weight: $font-weight-semibold;
      line-height: $line-height-snug;
    }

    &__footer {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-top: auto;
    }

    &__price {
      align-items: baseline;
      display: flex;
      gap: 4px;
    }

    &__price-val {
      font-size: $font-size-xl;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-extrabold;
    }

    &__unit {
      color: $color-ink-subtle;
      font-size: $font-size-xs;
    }

    &__add {
      @include square(40px);
      @include flex-center;

      background-color: $color-accent-bg;
      border-radius: $radius-sm;
      color: $color-accent;
      flex-shrink: 0;
      transition:
        background-color $transition-fast,
        color $transition-fast;

      &:hover {
        background-color: $color-accent;
        color: #fff;
      }
    }
  }
</style>
