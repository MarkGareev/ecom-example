<template>
  <div class="container articles-page">
    <nav class="breadcrumbs">
      <NuxtLink to="/">Home</NuxtLink>
      <span>→</span>
      <span>Blog</span>
    </nav>

    <h1 class="h1 articles-page__title">Blog</h1>

    <div v-if="pending" class="articles-grid">
      <div v-for="i in 6" :key="i" class="article-card article-card_skeleton" />
    </div>

    <div v-else-if="articles.length === 0" class="articles-page__empty">No articles yet</div>

    <div v-else class="articles-grid">
      <NuxtLink
        v-for="article in articles"
        :key="article.id"
        :to="`/articles/${article.slug}`"
        class="article-card"
      >
        <div class="article-card__image">
          <img v-if="article.imageUrl" :src="article.imageUrl" :alt="article.title" />
          <div v-else class="article-card__placeholder" />
        </div>
        <div class="article-card__body">
          <p class="article-card__date">{{ formatDate(article.publishedAt) }}</p>
          <h2 class="article-card__title">{{ article.title }}</h2>
          <p v-if="article.excerpt" class="article-card__excerpt">{{ article.excerpt }}</p>
          <span class="article-card__link">Read more →</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '~/shared/model/auth.store'
  import type { Article } from '~/shared/api/types'

  const auth = useAuthStore()

  const { data, pending } = await useAsyncData(
    'articles',
    () => auth.api.articles.list({ limit: 20 }),
    {
      default: () => ({
        data: [] as Article[],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }),
    },
  )

  const articles = computed(() => data.value?.data ?? [])

  function formatDate(iso: string | null) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
</script>

<style scoped lang="scss">
  .articles-page {
    padding-bottom: $sp-16;
    padding-top: $sp-6;

    &__title {
      margin-bottom: $sp-8;
      margin-top: $sp-2;
    }

    &__empty {
      color: $color-ink-muted;
      font-size: $font-size-md;
      padding: $sp-16 0;
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

  .articles-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .article-card {
    background-color: $color-surface;
    border: 1px solid $color-border-light;
    border-radius: $radius-xl;
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
      aspect-ratio: 16 / 9;
      overflow: hidden;

      img {
        height: 100%;
        object-fit: cover;
        transition: transform $transition-base;
        width: 100%;
      }

      &:hover img {
        transform: scale(1.03);
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

    &__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: $sp-2;
      padding: $sp-5;
    }

    &__date {
      color: $color-ink-subtle;
      font-size: $font-size-sm;
    }

    &__title {
      color: $color-ink;
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      line-height: $line-height-snug;
    }

    &__excerpt {
      color: $color-ink-muted;
      flex: 1;
      font-size: $font-size-base;
      line-height: $line-height-relaxed;
    }

    &__link {
      color: $color-accent;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      margin-top: $sp-2;
      transition: color $transition-fast;
    }

    &:hover &__link {
      color: $color-accent-hover;
    }

    &_skeleton {
      animation: shimmer 1.4s infinite;
      aspect-ratio: 3 / 4;
      background: linear-gradient(
        90deg,
        $color-border-light 25%,
        $color-divider 50%,
        $color-border-light 75%
      );
      background-size: 200% 100%;
      border: none;
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
