<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <slot />
    </main>
    <footer class="footer">
      <div class="container footer__inner">
        <AppLogo />
        <p class="footer__copy">&copy; {{ new Date().getFullYear() }} E-COME</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import AppLogo from '~/shared/ui/AppLogo.vue'
  import AppHeader from '~/widgets/header/AppHeader.vue'
</script>

<style scoped lang="scss">
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    &__main {
      flex: 1;
    }
  }

  .footer {
    background-color: $color-bg-footer;
    border-top: 1px solid $color-border-light;
    margin-top: $sp-16;
    padding-block: $sp-8;

    &__inner {
      @include flex-between;

      flex-wrap: wrap;
      gap: $sp-4;
    }

    &__copy {
      color: $color-ink-subtle;
      font-size: $font-size-base;
    }
  }
</style>
