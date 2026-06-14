<template>
  <div class="container catalog-hub">
    <nav class="breadcrumbs">
      <NuxtLink to="/">Home</NuxtLink>
      <span>→</span>
      <span>Catalog</span>
    </nav>

    <h1 class="h1 catalog-hub__title">Catalog</h1>
    <p class="catalog-hub__sub">Choose a category to browse products</p>

    <div v-if="pending" class="cat-grid">
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
  </div>
</template>

<script setup lang="ts">
  import type { IconName } from 'nuxt-svg-icon-module'
  import type { Category } from '~/shared/api/types'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { CATEGORIES } from '~/shared/lib'

  const auth = useAuthStore()

  const { data, pending } = await useAsyncData(
    'catalog-categories',
    () => auth.api.categories.list(),
    { default: (): Category[] => [] },
  )

  const categories = computed(() => (data.value?.length ? data.value : CATEGORIES))
</script>

<style scoped lang="scss">
  .catalog-hub {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__title {
      margin-bottom: $sp-3;
      margin-top: $sp-2;
    }

    &__sub {
      color: $color-ink-muted;
      font-size: $font-size-md;
      margin-bottom: $sp-10;
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

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
</style>
