<template>
  <header class="header">
    <div class="header__top">
      <div class="container header__inner">
        <AppLogo />

        <div class="search">
          <Icon name="search" class="search__icon" filled />
          <input
            v-model="searchQuery"
            class="search__input"
            type="search"
            placeholder="Search home goods…"
            @keydown.enter="onSearch"
          />
        </div>

        <div class="header__actions">
          <NuxtLink to="/account" class="header__icon-btn" aria-label="Account">
            <Icon name="user" filled />
          </NuxtLink>

          <NuxtLink to="/cart" class="header__cart">
            <Icon name="cart" filled />
            <span class="header__cart-total">
              {{ formatPrice(cart.total) }}
            </span>
            <span v-if="cart.count > 0" class="header__cart-badge">
              {{ cart.count }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <nav class="header__nav">
      <div class="container header__nav-inner">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/catalog/${cat.slug}`"
          class="header__nav-item"
          :class="{
            'header__nav-item_active': route.params.category === cat.slug,
          }"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { useCartStore } from '~/entities/cart/model/cart.store'
  import { formatPrice } from '~/shared/lib'
  import AppLogo from '~/shared/ui/AppLogo.vue'

  const cart = useCartStore()
  const route = useRoute()
  const router = useRouter()
  const searchQuery = ref((route.query.q as string) ?? '')

  watch(
    () => route.query.q,
    (q) => {
      searchQuery.value = (q as string) ?? ''
    },
  )

  const categories = [
    { name: 'Cookware', slug: 'cookware' },
    { name: 'Textiles', slug: 'textiles' },
    { name: 'Storage', slug: 'storage' },
    { name: 'Kitchen', slug: 'kitchen' },
    { name: 'Decor', slug: 'decor' },
    { name: 'Lighting', slug: 'lighting' },
    { name: 'Cleaning', slug: 'cleaning' },
    { name: 'Bathroom', slug: 'bathroom' },
  ]

  function onSearch() {
    const q = searchQuery.value.trim()
    if (q) {
      router.push({ path: '/catalog', query: { q } })
    } else {
      router.push('/catalog')
    }
  }
</script>

<style scoped lang="scss">
  .header {
    backdrop-filter: blur(8px);
    background-color: rgba($color-bg, 0.95);
    border-bottom: 1px solid $color-border-light;
    position: sticky;
    top: 0;
    z-index: $z-sticky;

    &__top {
      padding-block: 12px;
    }

    &__inner {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: $sp-3;
    }

    &__actions {
      align-items: center;
      display: flex;
      gap: $sp-2;
    }

    &__icon-btn {
      @include square(46px);
      @include flex-center;

      background-color: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink;
      flex-shrink: 0;
      transition: border-color $transition-fast;

      &:hover {
        border-color: $color-accent;
      }
    }

    &__cart {
      align-items: center;
      background-color: $color-dark;
      border-radius: $radius-sm;
      color: #fff;
      display: flex;
      gap: $sp-2;
      height: 46px;
      padding-inline: $sp-4;
      position: relative;
      transition: background-color $transition-fast;

      &:hover {
        background-color: $color-dark-gradient;
      }
    }

    &__cart-total {
      font-size: $font-size-base;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-semibold;
    }

    &__cart-badge {
      @include square(19px);
      @include flex-center;

      background-color: $color-accent;
      border-radius: $radius-full;
      font-size: 10px;
      font-weight: $font-weight-bold;
      position: absolute;
      right: -6px;
      top: -6px;
    }

    &__nav {
      border-top: 1px solid $color-border-light;
    }

    &__nav-inner {
      @include scrollbar-hidden;

      align-items: center;
      display: flex;
      gap: $sp-1;
      overflow-x: auto;
      padding-block: 10px;
    }

    &__nav-item {
      color: $color-ink-muted;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      padding: 4px 10px;
      position: relative;
      transition: color $transition-fast;
      white-space: nowrap;

      &::after {
        background-color: $color-accent;
        bottom: -1px;
        content: '';
        height: 2px;
        left: 10px;
        position: absolute;
        right: 10px;
        transform: scaleX(0);
        transition: transform $transition-fast;
      }

      &:hover,
      &_active {
        color: $color-ink;

        &::after {
          transform: scaleX(1);
        }
      }
    }
  }

  .search {
    align-items: center;
    background-color: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    display: flex;
    flex: 1 1 280px;
    gap: $sp-2;
    height: 46px;
    padding-inline: $sp-3;
    transition: border-color $transition-fast;

    &:focus-within {
      border-color: $color-accent;
    }

    &__icon {
      color: $color-ink-subtle;
      flex-shrink: 0;
    }

    &__input {
      background: none;
      border: none;
      color: $color-ink;
      flex: 1;
      outline: none;

      &::placeholder {
        color: $color-ink-subtle;
      }

      &::-webkit-search-cancel-button {
        display: none;
      }
    }
  }
</style>
