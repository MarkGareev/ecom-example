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

      <section class="reviews">
        <div class="reviews__head">
          <h2 class="h2">Reviews</h2>
          <span v-if="product.avgRating" class="reviews__avg">
            ★ {{ product.avgRating.toFixed(1) }} · {{ product._count.reviews }}
            {{ product._count.reviews === 1 ? 'review' : 'reviews' }}
          </span>
          <span v-else class="reviews__avg reviews__avg_empty">No reviews yet</span>
        </div>

        <div v-if="product.reviews.length" class="reviews__list">
          <div v-for="r in product.reviews" :key="r.id" class="review-card">
            <div class="review-card__top">
              <span class="review-card__author">{{ r.user.name ?? 'Anonymous' }}</span>
              <span class="review-card__stars"
                >{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span
              >
              <span class="review-card__date">{{ formatDate(r.createdAt) }}</span>
            </div>
            <p v-if="r.comment" class="review-card__comment">{{ r.comment }}</p>
          </div>
        </div>

        <div v-if="auth.isAuthenticated && !hasUserReview" class="review-form">
          <p class="review-form__title">Leave a Review</p>
          <div class="review-form__stars">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="review-form__star"
              :class="{ 'review-form__star_active': n <= reviewForm.rating }"
              @click="reviewForm.rating = n"
            >
              ★
            </button>
          </div>
          <textarea
            v-model="reviewForm.comment"
            class="review-form__textarea"
            placeholder="Share your experience (optional)"
            rows="3"
          />
          <p v-if="reviewError" class="review-form__error">{{ reviewError }}</p>
          <AppButton
            size="md"
            :disabled="reviewForm.rating === 0 || reviewPending"
            @click="submitReview"
          >
            {{ reviewPending ? 'Submitting…' : 'Submit Review' }}
          </AppButton>
        </div>
        <p v-else-if="!auth.isAuthenticated" class="reviews__login-hint">
          <NuxtLink to="/account">Sign in</NuxtLink> to leave a review
        </p>
      </section>

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
  import type { Product, ProductDetailWithReviews } from '~/shared/api/types'

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
    { default: (): ProductDetailWithReviews | null => null },
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

  const hasUserReview = computed(
    () => !!auth.user && !!product.value?.reviews.some((r) => r.user.id === auth.user?.id),
  )

  const reviewForm = reactive({ rating: 0, comment: '' })
  const reviewPending = ref(false)
  const reviewError = ref('')

  async function submitReview() {
    if (!product.value || reviewForm.rating === 0) return
    reviewError.value = ''
    reviewPending.value = true
    try {
      const review = await auth.api.products.createReview(slug.value, {
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      })
      product.value.reviews.unshift(review)
      product.value._count.reviews++
      const total = product.value.reviews.reduce((s, r) => s + r.rating, 0)
      product.value.avgRating = total / product.value.reviews.length
      reviewForm.rating = 0
      reviewForm.comment = ''
    } catch (err: unknown) {
      reviewError.value =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to submit review'
    } finally {
      reviewPending.value = false
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  .reviews {
    margin-bottom: $sp-12;
    margin-top: $sp-12;

    &__head {
      align-items: baseline;
      display: flex;
      gap: $sp-4;
      margin-bottom: $sp-6;
    }

    &__avg {
      color: $color-ink-muted;
      font-size: $font-size-base;

      &_empty {
        font-style: italic;
      }
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: $sp-3;
      margin-bottom: $sp-8;
    }

    &__login-hint {
      color: $color-ink-muted;
      font-size: $font-size-base;
      margin-top: $sp-6;

      a {
        color: $color-accent;
        font-weight: $font-weight-medium;
      }
    }
  }

  .review-card {
    background-color: $color-surface;
    border-radius: $radius-lg;
    padding: $sp-5;

    &__top {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: $sp-3;
      margin-bottom: $sp-2;
    }

    &__author {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
    }

    &__stars {
      color: #f5a623;
      font-size: $font-size-base;
      letter-spacing: 2px;
    }

    &__date {
      color: $color-ink-subtle;
      font-size: $font-size-sm;
      margin-left: auto;
    }

    &__comment {
      color: $color-ink-muted;
      font-size: $font-size-base;
      line-height: $line-height-relaxed;
    }
  }

  .review-form {
    background-color: $color-surface;
    border-radius: $radius-xl;
    display: flex;
    flex-direction: column;
    gap: $sp-4;
    margin-top: $sp-6;
    max-width: 560px;
    padding: $sp-6;

    &__title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
    }

    &__stars {
      display: flex;
      gap: $sp-1;
    }

    &__star {
      color: $color-border;
      cursor: pointer;
      font-size: 28px;
      line-height: 1;
      transition: color $transition-fast;

      &:hover,
      &_active {
        color: #f5a623;
      }
    }

    &__textarea {
      border: 1px solid $color-border;
      border-radius: $radius-md;
      color: $color-ink;
      font-family: $font-body;
      font-size: $font-size-base;
      line-height: $line-height-relaxed;
      padding: $sp-3;
      resize: vertical;
      transition: border-color $transition-fast;
      width: 100%;

      &:focus {
        border-color: $color-accent;
        outline: none;
      }
    }

    &__error {
      color: #c0392b;
      font-size: $font-size-base;
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
