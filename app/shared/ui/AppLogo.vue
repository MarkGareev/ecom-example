<template>
  <NuxtLink to="/" class="logo">
    <span class="logo__mark">
      <span class="logo__square" />
    </span>
    <span class="logo__text">
      <span class="logo__name">E-COME</span>
      <span class="logo__sub">home goods</span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
  .logo {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: $sp-2;
    text-decoration: none;

    &__mark {
      @include square(38px);
      @include flex-center;

      background-color: $color-accent;
      border-radius: $radius-logo;
      flex-shrink: 0;
    }

    &__square {
      border: 2.5px solid rgba($color-bg, 0.9);
      border-radius: 4px;
      height: 15px;
      width: 15px;
    }

    &__text {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    &__name {
      color: $color-ink;
      font-size: 19px;
      font-weight: $font-weight-extrabold;
      letter-spacing: 0.04em;
    }

    &__sub {
      color: $color-ink-subtle;
      font-size: 10.5px;
      letter-spacing: 0.14em;
      margin-top: 2px;
      text-transform: uppercase;
    }
  }
</style>
