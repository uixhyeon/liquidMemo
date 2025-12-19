<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const isReady = ref(false)

onMounted(async () => {
  // 인증 상태 초기화
  await auth.initialize()
  isReady.value = true
  
  // 라우터 가드 설정
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.meta.requiresAuth
    const requiresGuest = to.meta.requiresGuest
    
    if (requiresAuth && !auth.isLoggedIn) {
      // 로그인 필요한 페이지인데 로그인 안됨 → 로그인으로
      next('/login')
    } else if (requiresGuest && auth.isLoggedIn) {
      // 비로그인 페이지인데 로그인 됨 → 대시보드로
      next('/dashboard')
    } else {
      next()
    }
  })
  
  // 초기 라우팅 체크
  const currentRoute = router.currentRoute.value
  if (currentRoute.meta.requiresAuth && !auth.isLoggedIn) {
    router.push('/login')
  } else if (currentRoute.meta.requiresGuest && auth.isLoggedIn) {
    router.push('/dashboard')
  }
})
</script>

<template>
  <!-- 로딩 스크린 -->
  <div v-if="!isReady" class="loading-screen">
    <Loader2 :size="32" class="spin" />
  </div>
  
  <!-- 메인 앱 -->
  <router-view v-else />
</template>

<style lang="scss">
// 로딩 스크린
.loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  color: var(--text-soft);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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
