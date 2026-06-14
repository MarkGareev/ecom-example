<template>
  <div class="container error-page">
    <div class="error-page__inner">
      <p class="error-page__code">{{ error?.statusCode ?? 404 }}</p>
      <h1 class="error-page__title">
        {{ title }}
      </h1>
      <p class="error-page__sub">{{ subtitle }}</p>
      <div class="error-page__actions">
        <AppButton tag="NuxtLink" to="/" size="lg">Go to Home</AppButton>
        <AppButton variant="outline" size="lg" @click="handleError"> Try Again </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppButton from '~/shared/ui/AppButton.vue'

  const props = defineProps<{
    error: { statusCode?: number; message?: string } | null
  }>()

  const title = computed(() => {
    switch (props.error?.statusCode) {
      case 404:
        return 'Page Not Found'
      case 403:
        return 'Access Denied'
      case 500:
        return 'Server Error'
      default:
        return 'Something Went Wrong'
    }
  })

  const subtitle = computed(() => {
    switch (props.error?.statusCode) {
      case 404:
        return "The page you're looking for doesn't exist or has been moved."
      case 403:
        return "You don't have permission to view this page."
      case 500:
        return "We're working on fixing the problem. Please try again later."
      default:
        return props.error?.message ?? 'An unexpected error occurred.'
    }
  })

  function handleError() {
    clearError({ redirect: '/' })
  }
</script>

<style scoped lang="scss">
  .error-page {
    align-items: center;
    display: flex;
    min-height: 70vh;

    &__inner {
      margin: 0 auto;
      max-width: 480px;
      padding-block: $sp-16;
      text-align: center;
    }

    &__code {
      color: $color-accent;
      font-family: $font-display;
      font-size: clamp(80px, 15vw, 140px);
      font-weight: $font-weight-bold;
      line-height: 1;
      margin-bottom: $sp-4;
    }

    &__title {
      font-size: clamp(22px, 4vw, 32px);
      font-weight: $font-weight-bold;
      margin-bottom: $sp-3;
    }

    &__sub {
      color: $color-ink-muted;
      font-size: $font-size-md;
      line-height: $line-height-relaxed;
      margin-bottom: $sp-8;
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: $sp-3;
      justify-content: center;
    }
  }
</style>
