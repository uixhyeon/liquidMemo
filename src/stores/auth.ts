import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, sendOTP, verifyOTP, signOut as supabaseSignOut, getSession } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')

  // 초기화 - 기존 세션 확인
  async function initialize() {
    if (initialized.value) return
    
    loading.value = true
    try {
      const currentSession = await getSession()
      session.value = currentSession
      user.value = currentSession?.user || null
    } catch (e) {
      console.error('Auth init error:', e)
    } finally {
      loading.value = false
      initialized.value = true
    }

    // 인증 상태 변화 감지
    supabase.auth.onAuthStateChange((event, newSession) => {
      session.value = newSession
      user.value = newSession?.user || null
      
      if (event === 'SIGNED_OUT') {
        // 로그아웃 시 처리
      }
    })
  }

  // OTP 전송
  async function requestOTP(email: string, isSignup: boolean = false) {
    await sendOTP(email, isSignup)
  }

  // OTP 인증
  async function confirmOTP(email: string, token: string) {
    const loggedInUser = await verifyOTP(email, token)
    user.value = loggedInUser
    return loggedInUser
  }

  // 로그아웃
  async function logout() {
    await supabaseSignOut()
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
    loading,
    initialized,
    isLoggedIn,
    userEmail,
    initialize,
    requestOTP,
    confirmOTP,
    logout
  }
})

