<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click="emit('update:modelValue', false)">
      <div class="filters" role="dialog" aria-modal="true" @click.stop>
        <div class="filters__head">
          <span class="filters__title">Filters</span>
          <button
            class="filters__close"
            type="button"
            aria-label="Close"
            @click="emit('update:modelValue', false)"
          >
            <Icon name="close" filled />
          </button>
        </div>

        <div class="filters__section">
          <p class="filters__section-title">Category</p>
          <label v-for="cat in categories" :key="cat.slug" class="filters__checkbox-row">
            <span
              class="checkbox"
              :class="{
                checkbox_checked: selectedCategories.includes(cat.slug),
              }"
            >
              <Icon v-if="selectedCategories.includes(cat.slug)" name="check" filled />
            </span>
            <input v-model="selectedCategories" :value="cat.slug" type="checkbox" class="sr-only" />
            <span class="filters__checkbox-label">{{ cat.name }}</span>
          </label>
        </div>

        <div class="filters__section">
          <p class="filters__section-title">Price, $</p>
          <div class="filters__price-row">
            <input
              v-model.number="priceFrom"
              class="filters__price-input"
              type="number"
              placeholder="from"
              min="0"
            />
            <input
              v-model.number="priceTo"
              class="filters__price-input"
              type="number"
              placeholder="to"
              min="0"
            />
          </div>
        </div>

        <div class="filters__section">
          <p class="filters__section-title">Material</p>
          <div class="filters__tags">
            <button
              v-for="mat in materials"
              :key="mat"
              class="filters__tag"
              :class="{ filters__tag_active: selectedMaterials.includes(mat) }"
              type="button"
              @click="toggleMaterial(mat)"
            >
              {{ mat }}
            </button>
          </div>
        </div>

        <AppButton full @click="apply">Show Products</AppButton>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import AppButton from '~/shared/ui/AppButton.vue'

  defineProps<{
    modelValue: boolean
    categories: { slug: string; name: string }[]
    materials: string[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    apply: []
  }>()

  const selectedCategories = defineModel<string[]>('selectedCategories', {
    default: () => [],
  })
  const priceFrom = defineModel<number | undefined>('priceFrom', {
    default: undefined,
  })
  const priceTo = defineModel<number | undefined>('priceTo', {
    default: undefined,
  })
  const selectedMaterials = defineModel<string[]>('selectedMaterials', {
    default: () => [],
  })

  function toggleMaterial(mat: string) {
    const idx = selectedMaterials.value.indexOf(mat)
    if (idx >= 0) selectedMaterials.value.splice(idx, 1)
    else selectedMaterials.value.push(mat)
  }

  function apply() {
    emit('update:modelValue', false)
    emit('apply')
  }
</script>

<style scoped lang="scss">
  .overlay {
    @include absolute-fill;

    backdrop-filter: blur(2px);
    background-color: rgba($color-dark, 0.4);
    position: fixed;
    z-index: $z-overlay;
  }

  .filters {
    @include scrollbar-thin;

    background-color: $color-surface;
    border-radius: $radius-2xl;
    box-shadow: $shadow-modal;
    display: flex;
    flex-direction: column;
    gap: $sp-5;
    left: 50%;
    max-height: 86vh;
    max-width: 440px;
    overflow-y: auto;
    padding: $sp-6;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 32px);

    &__head {
      @include flex-between;
    }

    &__title {
      font-size: 18px;
      font-weight: $font-weight-bold;
    }

    &__close {
      @include square(36px);
      @include flex-center;

      background-color: $color-divider;
      border-radius: $radius-sm;
      color: $color-ink;
      flex-shrink: 0;
      transition: background-color $transition-fast;

      &:hover {
        background-color: $color-border;
      }
    }

    &__section {
      border-top: 1px solid $color-border-light;
      display: flex;
      flex-direction: column;
      gap: $sp-3;
      padding-top: $sp-5;
    }

    &__section-title {
      color: $color-ink;
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    &__checkbox-row {
      align-items: center;
      cursor: pointer;
      display: flex;
      gap: $sp-3;
    }

    &__checkbox-label {
      flex: 1;
      font-size: $font-size-md;
    }

    &__checkbox-count {
      color: $color-ink-subtle;
      font-size: $font-size-base;
    }

    &__price-row {
      display: flex;
      gap: $sp-3;
    }

    &__price-input {
      background-color: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink;
      flex: 1;
      height: 44px;
      min-width: 0;
      outline: none;
      padding-inline: $sp-3;
      transition: border-color $transition-fast;

      &::placeholder {
        color: $color-ink-subtle;
      }

      &:focus {
        border-color: $color-accent;
      }
    }

    &__tags {
      display: flex;
      flex-wrap: wrap;
      gap: $sp-2;
    }

    &__tag {
      background-color: $color-surface-soft;
      border: 1px solid $color-border;
      border-radius: $radius-sm;
      color: $color-ink-muted;
      font-size: $font-size-base;
      padding: 6px 14px;
      transition:
        border-color $transition-fast,
        color $transition-fast,
        background-color $transition-fast;

      &:hover {
        border-color: $color-accent;
        color: $color-accent;
      }

      &_active {
        background-color: $color-accent-bg;
        border-color: $color-accent;
        color: $color-accent-text;
      }
    }
  }

  .checkbox {
    @include square(18px);
    @include flex-center;

    border: 1.5px solid $color-scroll-thumb;
    border-radius: 5px;
    flex-shrink: 0;
    transition:
      border-color $transition-fast,
      background-color $transition-fast;

    &_checked {
      background-color: $color-accent;
      border-color: $color-accent;
    }
  }

  .sr-only {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
