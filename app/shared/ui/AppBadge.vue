<template>
  <span :class="['badge', `badge_${variant}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
  const { variant = 'accent' } = defineProps<{
    variant?: 'accent' | 'dark' | 'success'
  }>()
</script>

<style scoped lang="scss">
  .badge {
    border-radius: $radius-xs;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    letter-spacing: 0.04em;
    line-height: 1;
    padding: 4px 8px;

    &_accent {
      background-color: $color-accent-bg;
      color: $color-accent-text;
    }

    &_dark {
      background-color: $color-dark;
      color: #f6f2ec;
    }

    &_success {
      background-color: rgba(#5a9a6a, 0.12);
      color: $color-success;
    }
  }
</style>
