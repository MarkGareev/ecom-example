<template>
  <div class="container article-page">
    <div v-if="pending" class="article-page__loading">Loading…</div>

    <template v-else-if="article">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Home</NuxtLink>
        <span>→</span>
        <NuxtLink to="/articles">Blog</NuxtLink>
        <span>→</span>
        <span>{{ article.title }}</span>
      </nav>

      <header class="article-header">
        <p class="article-header__date">{{ formatDate(article.publishedAt) }}</p>
        <h1 class="h1 article-header__title">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="article-header__excerpt">{{ article.excerpt }}</p>
      </header>

      <div v-if="article.imageUrl" class="article-cover">
        <img :src="article.imageUrl" :alt="article.title" />
      </div>

      <div class="article-body">
        {{ article.content }}
      </div>
    </template>

    <div v-else class="article-page__error">Article not found</div>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '~/shared/model/auth.store'
  import type { ArticleDetail } from '~/shared/api/types'

  const auth = useAuthStore()
  const route = useRoute()
  const slug = computed(() => route.params.slug as string)

  const { data: article, pending } = await useAsyncData(
    () => `article-${slug.value}`,
    () => auth.api.articles.get(slug.value),
    { default: (): ArticleDetail | null => null },
  )

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
  .article-page {
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

  .article-header {
    margin-bottom: $sp-8;
    max-width: 720px;

    &__date {
      color: $color-ink-subtle;
      font-size: $font-size-sm;
      margin-bottom: $sp-3;
    }

    &__title {
      margin-bottom: $sp-4;
    }

    &__excerpt {
      color: $color-ink-muted;
      font-size: $font-size-lg;
      line-height: $line-height-relaxed;
    }
  }

  .article-cover {
    border-radius: $radius-xl;
    margin-bottom: $sp-10;
    overflow: hidden;

    img {
      aspect-ratio: 16 / 7;
      display: block;
      object-fit: cover;
      width: 100%;
    }
  }

  .article-body {
    color: $color-ink;
    font-size: $font-size-md;
    line-height: $line-height-relaxed;
    max-width: 720px;
    white-space: pre-wrap;
  }
</style>
