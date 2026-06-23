<template>
  <div class="container catalog">
    <nav class="breadcrumbs">
      <NuxtLink to="/">Home</NuxtLink>
      <span>→</span>
      <NuxtLink to="/catalog">Catalog</NuxtLink>
      <span>→</span>
      <span>{{ categoryName }}</span>
    </nav>

    <div class="catalog__header">
      <h1 class="h1">{{ categoryName }}</h1>
      <span class="catalog__count">{{ total }} items</span>
    </div>

    <div class="toolbar">
      <div class="toolbar__left">
        <button class="toolbar__filter-btn" type="button" @click="filtersOpen = true">
          <Icon name="filters" filled />
          Filters
          <span v-if="activeFilters.length" class="toolbar__filter-count">
            {{ activeFilters.length }}
          </span>
        </button>
        <button
          v-for="chip in activeFilters"
          :key="chip.key"
          class="toolbar__chip"
          type="button"
          @click="removeFilter(chip.key)"
        >
          {{ chip.label }} ×
        </button>
      </div>
      <div class="toolbar__right">
        <span class="toolbar__sort-label">Sort by:</span>
        <div class="select-wrap">
          <select v-model="sort" class="select-wrap__select">
            <option value="">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="new">Newest</option>
          </select>
          <Icon name="chevron-down" class="select-wrap__chevron" filled />
        </div>
      </div>
    </div>

    <div v-if="pending" class="products-grid">
      <div v-for="i in 12" :key="i" class="skeleton" />
    </div>
    <div v-else-if="products.length === 0" class="catalog__empty">
      Nothing found. Try adjusting your filters.
    </div>
    <div v-else class="products-grid">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>

    <FiltersModal
      v-model="filtersOpen"
      v-model:selected-categories="selectedCategories"
      v-model:price-from="priceFrom"
      v-model:price-to="priceTo"
      v-model:selected-materials="selectedMaterials"
      :categories="filterCategories"
      :materials="materials"
      @apply="refresh"
    />
  </div>
</template>

<script setup lang="ts">
  import ProductCard from '~/entities/product/ui/ProductCard.vue'
  import FiltersModal from '~/widgets/catalog/FiltersModal.vue'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { CATEGORIES, capitalize } from '~/shared/lib'
  import type { Product } from '~/shared/api/types'

  const auth = useAuthStore()
  const route = useRoute()
  const category = computed(() => route.params.category as string)

  const categoryLabels = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]))

  const categoryName = computed(() => categoryLabels[category.value] ?? capitalize(category.value))

  const filtersOpen = ref(false)
  const sort = ref('')
  const selectedCategories = ref<string[]>([])
  const priceFrom = ref<number | undefined>(undefined)
  const priceTo = ref<number | undefined>(undefined)
  const selectedMaterials = ref<string[]>([])

  const query = computed(() => ({
    category: category.value,
    ...(sort.value && { sort: sort.value }),
    ...(route.query.q ? { q: route.query.q as string } : {}),
  }))

  const { data, pending, refresh } = await useAsyncData(
    () => `catalog-${category.value}`,
    () => auth.api.products.list(query.value),
    {
      watch: [query],
      default: () => ({ data: [] as Product[], meta: { total: 0 } }),
    },
  )

  const products = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.meta?.total ?? 0)

  const filterCategories = CATEGORIES

  const materials = ['Ceramic', 'Glass', 'Wood', 'Cotton', 'Bamboo']

  const activeFilters = computed(() => {
    const result: { key: string; label: string }[] = []
    selectedCategories.value.forEach((s) => {
      const cat = filterCategories.find((c) => c.slug === s)
      if (cat) result.push({ key: `cat:${s}`, label: cat.name })
    })
    selectedMaterials.value.forEach((m) => result.push({ key: `mat:${m}`, label: m }))
    return result
  })

  function removeFilter(key: string) {
    if (key.startsWith('cat:')) {
      selectedCategories.value = selectedCategories.value.filter((s) => s !== key.slice(4))
    } else if (key.startsWith('mat:')) {
      selectedMaterials.value = selectedMaterials.value.filter((m) => m !== key.slice(4))
    }
    refresh()
  }
</script>

<style scoped lang="scss">
  @use 'sass:color';

  .catalog {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__header {
      align-items: baseline;
      display: flex;
      gap: $sp-3;
      margin-bottom: $sp-6;
    }

    &__count {
      color: $color-ink-subtle;
      font-size: $font-size-base;
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

  .toolbar {
    @include flex-between;

    flex-wrap: wrap;
    gap: $sp-3;
    margin-bottom: $sp-6;

    &__left,
    &__right {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: $sp-2;
    }

    &__filter-btn {
      align-items: center;
      background-color: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink;
      display: flex;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      gap: $sp-2;
      height: 40px;
      padding-inline: $sp-4;
      transition:
        border-color $transition-fast,
        color $transition-fast;

      &:hover {
        border-color: $color-accent;
        color: $color-accent;
      }
    }

    &__filter-count {
      @include square(18px);
      @include flex-center;

      background-color: $color-accent;
      border-radius: $radius-full;
      color: #fff;
      font-size: 10px;
      font-weight: $font-weight-bold;
    }

    &__chip {
      background-color: $color-accent-bg;
      border: none;
      border-radius: 9px;
      color: $color-accent-text;
      cursor: pointer;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      padding: 6px 12px;
      transition: background-color $transition-fast;

      &:hover {
        background-color: color.adjust(#f3e7e0, $lightness: -5%);
      }
    }

    &__sort-label {
      color: $color-ink-muted;
      font-size: $font-size-base;
    }
  }

  .select-wrap {
    position: relative;

    &__select {
      appearance: none;
      background-color: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink;
      font-size: $font-size-base;
      height: 40px;
      padding-inline: $sp-3 36px;
      transition: border-color $transition-fast;

      &:focus {
        border-color: $color-accent;
        outline: none;
      }
    }

    &__chevron {
      color: $color-ink-muted;
      pointer-events: none;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
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
