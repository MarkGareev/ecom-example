<template>
  <div>
    <section class="hero container">
      <div class="hero__main">
        <span class="hero__eyebrow">New Collection</span>
        <h1 class="hero__title h1-hero">Cozy Living,<br />Built from Details</h1>
        <p class="hero__sub">Everything for a warm home — from cookware to textiles</p>
        <AppButton tag="NuxtLink" to="/catalog" size="lg"> Browse Catalog </AppButton>
        <div class="hero__decor-circle" />
        <div class="hero__decor-square" />
      </div>
      <div class="hero__promo">
        <span class="hero__promo-eyebrow">Cozy Season</span>
        <h2 class="hero__promo-title">Warm Textiles<br />up to −20%</h2>
        <div class="hero__promo-image" />
      </div>
    </section>

    <section class="section container">
      <div class="section__head">
        <h2 class="h2">Categories</h2>
        <NuxtLink to="/catalog" class="section__link">All categories →</NuxtLink>
      </div>
      <div class="categories">
        <NuxtLink
          v-for="category in categories"
          :key="category.slug"
          :to="`/catalog/${category.slug}`"
          class="cat-card"
        >
          <span class="cat-card__icon">
            <Icon :name="`category/${category.slug}` as IconName" filled />
          </span>
          <span class="cat-card__name">{{ category.name }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="section container">
      <div class="section__head">
        <h2 class="h2">Popular</h2>
        <NuxtLink to="/catalog" class="section__link">View all</NuxtLink>
      </div>
      <div v-if="pending" class="products-grid">
        <div v-for="i in 8" :key="i" class="skeleton" />
      </div>
      <div v-else class="products-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import AppButton from '~/shared/ui/AppButton.vue'
  import ProductCard from '~/entities/product/ui/ProductCard.vue'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { CATEGORIES } from '~/shared/lib'
  import type { IconName } from 'nuxt-svg-icon-module'
  import type { Product } from '~/shared/api/types'

  const auth = useAuthStore()

  const { data: productsData, pending } = await useAsyncData(
    'home-products',
    () => auth.api.products.list({ limit: 8 }),
    { default: () => ({ data: [] as Product[], meta: { total: 0 } }) },
  )

  const products = computed(() => productsData.value?.data ?? [])

  const categories = CATEGORIES
</script>

<style scoped lang="scss">
  .hero {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    padding-top: $sp-8;

    &__main {
      background: linear-gradient(135deg, $color-dark 0%, $color-dark-gradient 100%);
      border-radius: $radius-2xl;
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: $sp-4;
      grid-column: span 2;
      min-height: 300px;
      overflow: hidden;
      padding: clamp(28px, 4vw, 52px);
      position: relative;

      @include respond-below(md) {
        grid-column: span 1;
      }
    }

    &__eyebrow {
      color: $color-accent-hero;
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    &__title {
      color: #fff;
    }

    &__sub {
      color: $color-ink-on-dark;
      font-size: $font-size-md;
      max-width: 340px;
    }

    &__decor-circle {
      background-color: rgba($color-accent, 0.13);
      border-radius: $radius-full;
      bottom: -60px;
      height: 220px;
      pointer-events: none;
      position: absolute;
      right: -60px;
      width: 220px;
    }

    &__decor-square {
      border: 1px solid rgba(#fff, 0.12);
      border-radius: $radius-xl;
      height: 100px;
      pointer-events: none;
      position: absolute;
      right: 40px;
      top: 30px;
      transform: rotate(15deg);
      width: 100px;
    }

    &__promo {
      background-color: #efe6da;
      border-radius: $radius-2xl;
      display: flex;
      flex-direction: column;
      gap: $sp-3;
      min-height: 220px;
      overflow: hidden;
      padding: clamp(20px, 3vw, 32px);
      position: relative;
    }

    &__promo-eyebrow {
      color: #b07a5e;
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    &__promo-title {
      color: $color-ink;
      font-family: $font-display;
      font-size: clamp(18px, 2.2vw, 26px);
      font-weight: $font-weight-semibold;
    }

    &__promo-image {
      background: repeating-linear-gradient(
        135deg,
        #f1eae0 0,
        #f1eae0 11px,
        #ebe2d5 11px,
        #ebe2d5 22px
      );
      border-radius: $radius-lg;
      flex: 1;
      min-height: 80px;
    }
  }

  .section {
    margin-top: $sp-12;

    &__head {
      @include flex-between;

      margin-bottom: $sp-6;
    }

    &__link {
      color: $color-accent;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      transition: color $transition-fast;

      &:hover {
        color: $color-accent-hover;
      }
    }
  }

  .categories {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .cat-card {
    align-items: flex-start;
    background-color: $color-surface;
    border: 1px solid $color-border-light;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    gap: $sp-2;
    padding: $sp-5;
    transition:
      box-shadow $transition-base,
      transform $transition-base;

    &:hover {
      box-shadow: $shadow-category;
      transform: translateY(-3px);
    }

    &__icon {
      @include square(46px);
      @include flex-center;

      background-color: $color-accent-bg;
      border-radius: $radius-md;
      color: $color-accent;
      flex-shrink: 0;
    }

    &__name {
      color: $color-ink;
      font-size: $font-size-md;
      font-weight: $font-weight-semibold;
      margin-top: $sp-1;
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
