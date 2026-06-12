<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">{{ label }}</label>
    <input
      :id="id"
      class="field__input"
      v-bind="$attrs"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
  const {
    modelValue = '',
    label = '',
    id = undefined,
  } = defineProps<{
    modelValue?: string
    label?: string
    id?: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  defineOptions({ inheritAttrs: false })
</script>

<style scoped lang="scss">
  .field {
    display: flex;
    flex-direction: column;
    gap: $sp-1;

    &__label {
      color: $color-ink-muted;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
    }

    &__input {
      background-color: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink;
      height: 48px;
      outline: none;
      padding-inline: $sp-4;
      transition: border-color $transition-fast;
      width: 100%;

      &::placeholder {
        color: $color-ink-subtle;
      }

      &:focus {
        border-color: $color-accent;
      }
    }
  }
</style>
