<template>
  <div class="container product-page">
    <div v-if="pending" class="product-page__loading">Loading…</div>

    <template v-else-if="product">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Home</NuxtLink>
        <span>→</span>
        <NuxtLink to="/catalog">Catalog</NuxtLink>
        <span>→</span>
        <NuxtLink :to="`/catalog/${route.params.category}`">
          {{ categoryName }}
        </NuxtLink>
        <span>→</span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product">
        <div class="gallery">
          <div class="gallery__main">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
            <div v-else class="gallery__placeholder" />
          </div>
          <div class="gallery__thumbs">
            <div
              v-for="i in 4"
              :key="i"
              class="gallery__thumb"
              :class="{ gallery__thumb_active: i === 1 }"
            >
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
              <div v-else class="gallery__placeholder gallery__placeholder_sm" />
            </div>
          </div>
        </div>

        <div class="info">
          <div class="info__top">
            <AppBadge v-if="product.discount" variant="accent"> −{{ product.discount }}% </AppBadge>
          </div>

          <h1 class="h1 info__title">{{ product.name }}</h1>

          <div class="info__price-row">
            <span class="price-lg">{{ formatPrice(finalPrice) }}</span>
            <span class="info__unit">/ pc.</span>
            <span v-if="product.discount" class="info__old-price">
              {{ formatPrice(product.price) }}
            </span>
          </div>

          <div class="info__status">
            <span class="info__stock">● In stock · ships today</span>
          </div>

          <div class="info__actions">
            <AppStepper v-model="qty" :min="1" :max="product.stock" />
            <AppButton class="info__cart-btn" size="lg" @click="addToCart">
              Add to Cart · {{ formatPrice(finalPrice * qty) }}
            </AppButton>
          </div>

          <div class="specs">
            <p class="specs__title">Specifications</p>
            <dl class="specs__list">
              <div v-for="spec in specs" :key="spec.label" class="specs__row">
                <dt class="specs__key">{{ spec.label }}</dt>
                <dd class="specs__val">{{ spec.value }}</dd>
              </div>
            </dl>
          </div>

          <p v-if="product.description" class="info__desc">
            {{ product.description }}
          </p>
        </div>
      </div>

      <section v-if="related.length" class="related">
        <h2 class="h2 related__title">Frequently Bought Together</h2>
        <div class="products-grid">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
      </section>
    </template>

    <div v-else class="product-page__error">Product not found</div>
  </div>
</template>

<script setup lang="ts">
  import AppBadge from '~/shared/ui/AppBadge.vue'
  import AppButton from '~/shared/ui/AppButton.vue'
  import AppStepper from '~/shared/ui/AppStepper.vue'
  import ProductCard from '~/entities/product/ui/ProductCard.vue'
  import { useCartStore } from '~/entities/cart/model/cart.store'
  import { useAuthStore } from '~/shared/model/auth.store'
  import { formatPrice } from '~/shared/lib'
  import type { Product, ProductDetail } from '~/shared/api/types'

  const route = useRoute()
  const auth = useAuthStore()
  const cart = useCartStore()
  const router = useRouter()
  const qty = ref(1)

  const categoryLabels: Record<string, string> = {
    cookware: 'Cookware',
    textiles: 'Textiles',
    storage: 'Storage',
    kitchen: 'Kitchen',
    decor: 'Decor',
    lighting: 'Lighting',
    cleaning: 'Cleaning',
    bathroom: 'Bathroom',
  }

  const categoryName = computed(
    () => categoryLabels[route.params.category as string] ?? route.params.category,
  )

  const slug = computed(() => route.params.slug as string)

  const { data: productData, pending } = await useAsyncData(
    () => `product-${slug.value}`,
    () => auth.api.products.get(slug.value),
    { default: (): ProductDetail | null => null },
  )

  const product = computed(() => productData.value)

  const finalPrice = computed(() => {
    if (!product.value) return 0
    const { price, discount } = product.value
    return discount ? price * (1 - discount / 100) : price
  })

  const { data: relatedData } = await useAsyncData(
    () => `product-${slug.value}-related`,
    () => auth.api.products.related(slug.value),
    { default: (): Product[] => [] },
  )
  const related = computed(() => relatedData.value ?? [])

  const specs = computed(() => {
    if (!product.value) return []
    return [
      { label: 'Category', value: product.value.category?.name ?? '—' },
      { label: 'In Stock', value: `${product.value.stock ?? 0} pcs.` },
    ]
  })

  async function addToCart() {
    if (!product.value) return
    if (auth.isAuthenticated) {
      await cart.serverAdd(auth.api, product.value.id, qty.value)
    } else {
      cart.localAdd(product.value, qty.value)
    }
    router.push('/cart')
  }
</script>

<style scoped lang="scss">
  .product-page {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__loading,
    &__error {
      color: $color-ink-muted;
      padding: $sp-16 0;
      text-align: center;
    }
  }

  .breadcrumbs {
    align-items: center;
    color: $color-ink-subtle;
    display: flex;
    flex-wrap: wrap;
    font-size: $font-size-sm;
    gap: $sp-2;
    margin-bottom: $sp-6;

    a {
      transition: color $transition-fast;

      &:hover {
        color: $color-accent;
      }
    }
  }

  .product {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: $sp-8;
    margin-bottom: $sp-12;
  }

  .gallery {
    display: flex;
    flex: 1 1 360px;
    flex-direction: column;
    gap: $sp-3;

    &__main {
      aspect-ratio: 1 / 1;
      background-color: $color-surface;
      border: 1px solid $color-border-light;
      border-radius: $radius-xl;
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

      &_sm {
        height: 100%;
      }
    }

    &__thumbs {
      display: grid;
      gap: $sp-2;
      grid-template-columns: repeat(4, 1fr);
    }

    &__thumb {
      aspect-ratio: 1 / 1;
      border: 1.5px solid $color-border-light;
      border-radius: $radius-md;
      cursor: pointer;
      overflow: hidden;
      transition: border-color $transition-fast;

      img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }

      &_active {
        border-color: $color-accent;
      }
    }
  }

  .info {
    display: flex;
    flex: 1 1 360px;
    flex-direction: column;
    gap: $sp-4;

    &__top {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: $sp-3;
    }

    &__sku {
      color: $color-ink-subtle;
      font-size: $font-size-sm;
    }

    &__title {
      margin-top: $sp-1;
    }

    &__price-row {
      align-items: baseline;
      display: flex;
      gap: $sp-2;
    }

    &__unit {
      color: $color-ink-muted;
      font-size: $font-size-md;
    }

    &__old-price {
      color: $color-ink-subtle;
      font-size: $font-size-xl;
      font-variant-numeric: tabular-nums;
      text-decoration: line-through;
    }

    &__status {
      margin-top: $sp-1;
    }

    &__stock {
      color: $color-success;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
    }

    &__actions {
      align-items: stretch;
      display: flex;
      gap: $sp-3;
      margin-top: $sp-2;
    }

    &__cart-btn {
      flex: 1;
    }

    &__desc {
      color: #5d564f;
      font-size: $font-size-md;
      line-height: $line-height-relaxed;
    }
  }

  .specs {
    background-color: $color-surface;
    border: 1px solid $color-border-light;
    border-radius: $radius-lg;
    padding: $sp-5;

    &__title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      letter-spacing: 0.06em;
      margin-bottom: $sp-4;
      text-transform: uppercase;
    }

    &__list {
      display: flex;
      flex-direction: column;
    }

    &__row {
      align-items: center;
      border-bottom: 1px solid $color-divider;
      display: flex;
      justify-content: space-between;
      padding-block: $sp-3;

      &:last-child {
        border-bottom: none;
      }
    }

    &__key {
      color: $color-ink-muted;
      font-size: $font-size-base;
    }

    &__val {
      color: $color-ink;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      text-align: right;
    }
  }

  .related {
    &__title {
      margin-bottom: $sp-6;
    }
  }

  .products-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
</style>
