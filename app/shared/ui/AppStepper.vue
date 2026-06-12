<template>
  <div class="stepper" :class="`stepper_${size}`">
    <button class="stepper__btn" type="button" :disabled="modelValue <= min" @click="dec">−</button>
    <span class="stepper__val">{{ modelValue }}</span>
    <button class="stepper__btn" type="button" :disabled="modelValue >= max" @click="inc">+</button>
  </div>
</template>

<script setup lang="ts">
  const {
    modelValue,
    min = 1,
    max = 99,
    size = 'md',
  } = defineProps<{
    modelValue: number
    min?: number
    max?: number
    size?: 'sm' | 'md'
  }>()

  const emit = defineEmits<{
    'update:modelValue': [v: number]
  }>()

  function dec() {
    if (modelValue > min) emit('update:modelValue', modelValue - 1)
  }
  function inc() {
    if (modelValue < max) emit('update:modelValue', modelValue + 1)
  }
</script>

<style scoped lang="scss">
  .stepper {
    align-items: center;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    display: inline-flex;
    gap: 0;
    overflow: hidden;

    &_md {
      height: 54px;

      .stepper__btn {
        width: 48px;
      }

      .stepper__val {
        min-width: 40px;
      }
    }

    &_sm {
      height: 42px;

      .stepper__btn {
        width: 40px;
      }

      .stepper__val {
        min-width: 32px;
      }
    }

    &__btn {
      align-items: center;
      background: $color-surface;
      color: $color-ink;
      display: flex;
      font-size: 1.25rem;
      font-weight: $font-weight-medium;
      height: 100%;
      justify-content: center;
      transition: background-color $transition-fast;

      &:hover:not(:disabled) {
        background-color: $color-accent-bg;
        color: $color-accent;
      }

      &:disabled {
        color: $color-ink-subtle;
        cursor: not-allowed;
      }
    }

    &__val {
      background: $color-surface;
      font-size: $font-size-md;
      font-variant-numeric: tabular-nums;
      font-weight: $font-weight-semibold;
      text-align: center;
    }
  }
</style>
