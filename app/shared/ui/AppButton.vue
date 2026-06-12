<template>
  <component
    :is="component"
    :class="['btn', `btn_${variant}`, `btn_${size}`, { btn_full: full }]"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
  const {
    tag = 'button',
    variant = 'accent',
    size = 'md',
    full = false,
  } = defineProps<{
    tag?: 'button' | 'a' | 'NuxtLink'
    variant?: 'accent' | 'dark' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    full?: boolean
  }>()

  const component = computed(() => (tag === 'NuxtLink' ? resolveComponent('NuxtLink') : tag))
</script>

<style scoped lang="scss">
  .btn {
    align-items: center;
    border-radius: $radius-sm;
    cursor: pointer;
    display: inline-flex;
    font-family: $font-body;
    font-weight: $font-weight-semibold;
    gap: $sp-2;
    justify-content: center;
    transition:
      background-color $transition-fast,
      color $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast,
      transform $transition-fast;
    white-space: nowrap;

    &_sm {
      border-radius: $radius-xs;
      font-size: $font-size-base;
      height: 36px;
      padding-inline: $sp-3;
    }

    &_md {
      font-size: $font-size-base;
      height: 46px;
      padding-inline: $sp-5;
    }

    &_lg {
      font-size: $font-size-md;
      height: 54px;
      padding-inline: $sp-6;
    }

    &_full {
      width: 100%;
    }

    &_accent {
      background-color: $color-accent;
      box-shadow: $shadow-btn;
      color: #fff;

      &:hover {
        background-color: $color-accent-hover;
      }

      &:active {
        transform: translateY(1px);
      }
    }

    &_dark {
      background-color: $color-dark;
      color: #fff;

      &:hover {
        background-color: $color-dark-gradient;
      }
    }

    &_outline {
      background-color: $color-surface;
      border: 1px solid $color-border;
      color: $color-ink;

      &:hover {
        border-color: $color-accent;
        color: $color-accent;
      }
    }

    &_ghost {
      background-color: transparent;
      color: $color-ink-muted;

      &:hover {
        color: $color-ink;
      }
    }
  }
</style>
