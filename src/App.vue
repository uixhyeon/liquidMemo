<script setup lang="ts">
// 스토어는 생성 시 자동으로 데이터를 로드합니다
</script>

<template>
  <router-view />
</template>

<style lang="scss">
// 전역 트랜지션
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
