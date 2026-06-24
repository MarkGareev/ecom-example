<template>
  <div class="container catalog-hub">
    <nav class="breadcrumbs">
      <NuxtLink to="/">Home</NuxtLink>
      <span>→</span>
      <span>Catalog</span>
    </nav>

    <template v-if="searchQuery">
      <div class="catalog-hub__header">
        <h1 class="h1 catalog-hub__title">Search: "{{ searchQuery }}"</h1>
        <span class="catalog-hub__count">{{ total }} results</span>
      </div>

      <div v-if="searchPending" class="products-grid">
        <div v-for="i in 12" :key="i" class="skeleton" />
      </div>
      <div v-else-if="products.length === 0" class="catalog-hub__empty">
        Nothing found for "{{ searchQuery }}"
      </div>
      <div v-else class="products-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </template>

    <template v-else>
      <h1 class="h1 catalog-hub__title">Catalog</h1>
      <p class="catalog-hub__sub">Choose a category to browse products</p>

      <div v-if="categoriesPending" class="cat-grid">
        <div v-for="i in 8" :key="i" class="cat-card cat-card_skeleton" />
      </div>
      <div v-else class="cat-grid">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/catalog/${cat.slug}`"
          class="cat-card"
        >
          <span class="cat-card__icon">
            <Icon :name="`category/${cat.slug}` as IconName" filled />
          </span>
          <span class="cat-card__name">{{ cat.name }}</span>
          <span class="cat-card__arrow">→</span>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { IconName } from 'nuxt-svg-icon-module'
  import type { Category, Product } from '~/shared/api/types'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { CATEGORIES } from '~/shared/lib'
  import ProductCard from '~/entities/product/ui/ProductCard.vue'

  const auth = useAuthStore()
  const route = useRoute()

  const searchQuery = computed(() => (route.query.q as string) ?? '')

  const { data: categoriesData, pending: categoriesPending } = await useAsyncData(
    'catalog-categories',
    () => auth.api.categories.list(),
    { default: (): Category[] => [] },
  )
  const categories = computed(() =>
    categoriesData.value?.length ? categoriesData.value : CATEGORIES,
  )

  const { data: searchData, pending: searchPending } = await useAsyncData(
    () => `search-${searchQuery.value}`,
    () =>
      searchQuery.value
        ? auth.api.products.list({ search: searchQuery.value, limit: 48 })
        : Promise.resolve({
            data: [] as Product[],
            meta: { total: 0, page: 1, limit: 48, totalPages: 0 },
          }),
    {
      watch: [searchQuery],
      default: () => ({
        data: [] as Product[],
        meta: { total: 0, page: 1, limit: 48, totalPages: 0 },
      }),
    },
  )

  const products = computed(() => searchData.value?.data ?? [])
  const total = computed(() => searchData.value?.meta?.total ?? 0)
</script>

<style scoped lang="scss">
  .catalog-hub {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__header {
      align-items: baseline;
      display: flex;
      gap: $sp-3;
      margin-bottom: $sp-6;
    }

    &__title {
      margin-bottom: $sp-3;
      margin-top: $sp-2;
    }

    &__count {
      color: $color-ink-subtle;
      font-size: $font-size-base;
    }

    &__sub {
      color: $color-ink-muted;
      font-size: $font-size-md;
      margin-bottom: $sp-10;
    }

    &__empty {
      color: $color-ink-muted;
      font-size: $font-size-md;
      margin-top: $sp-8;
      text-align: center;
    }
  }

  .breadcrumbs {
    align-items: center;
    color: $color-ink-subtle;
    display: flex;
    font-size: $font-size-sm;
    gap: $sp-2;
    margin-bottom: $sp-4;

    a {
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }
  }

  .cat-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .cat-card {
    align-items: flex-start;
    background-color: $color-surface;
    border: 1px solid $color-border-light;
    border-radius: $radius-xl;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: $sp-3;
    padding: $sp-6;
    transition:
      box-shadow $transition-base,
      transform $transition-base,
      border-color $transition-fast;

    &:hover {
      border-color: $color-accent;
      box-shadow: $shadow-category;
      transform: translateY(-3px);
    }

    &__icon {
      @include square(48px);
      @include flex-center;

      background-color: $color-accent-bg;
      border-radius: $radius-md;
      color: $color-accent;
      flex-shrink: 0;
    }

    &__name {
      color: $color-ink;
      flex: 1;
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      margin-top: $sp-1;
    }

    &__arrow {
      align-self: flex-end;
      color: $color-ink-subtle;
      font-size: $font-size-base;
      transition: color $transition-fast;
    }

    &:hover &__arrow {
      color: $color-accent;
    }

    &_skeleton {
      animation: shimmer 1.4s infinite;
      aspect-ratio: 1 / 1.1;
      background: linear-gradient(
        90deg,
        $color-border-light 25%,
        $color-divider 50%,
        $color-border-light 75%
      );
      background-size: 200% 100%;
      border: none;
      cursor: default;
      transform: none;

      &:hover {
        border-color: $color-border-light;
        box-shadow: none;
        transform: none;
      }
    }
  }

  .products-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }

  .skeleton {
    animation: shimmer 1.4s infinite;
    aspect-ratio: 1 / 1.3;
    background: linear-gradient(
      90deg,
      $color-border-light 25%,
      $color-divider 50%,
      $color-border-light 75%
    );
    background-size: 200% 100%;
    border-radius: $radius-lg;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
</style>
