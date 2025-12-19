<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, KeyRound, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const otpCode = ref('')
const step = ref<'email' | 'otp'>('email')
const loading = ref(false)
const error = ref('')

// OTP 전송 (회원가입용)
const handleSendOTP = async () => {
  if (!email.value.trim()) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 회원가입용 OTP 전송 (shouldCreateUser: true로 자동 계정 생성)
    await auth.requestOTP(email.value.trim(), true)
    step.value = 'otp'
  } catch (e: any) {
    error.value = e.message || '이메일 전송에 실패했습니다. 다시 시도해주세요.'
  } finally {
    loading.value = false
  }
}

// OTP 인증 (회원가입 완료)
const handleVerifyOTP = async () => {
  if (!otpCode.value.trim()) return
  
  loading.value = true
  error.value = ''
  
  try {
    await auth.confirmOTP(email.value.trim(), otpCode.value.trim())
    // 회원가입 완료 후 대시보드로 이동
    router.push('/dashboard')
  } catch (e: any) {
    error.value = '인증번호가 올바르지 않습니다. 다시 확인해주세요.'
  } finally {
    loading.value = false
  }
}

// 이메일 다시 입력
const goBack = () => {
  step.value = 'email'
  otpCode.value = ''
  error.value = ''
}

// 랜딩으로
const goToLanding = () => {
  router.push('/')
}

// 로그인으로
const goToLogin = () => {
  router.push('/login')
}

// 인증번호 입력 시 자동으로 6자리 제한
const handleOtpInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  target.value = target.value.replace(/[^0-9]/g, '').slice(0, 6)
  otpCode.value = target.value
}
</script>

<template>
  <div class="signup-page">
    <!-- 배경 장식 -->
    <div class="bg-decoration">
      <div class="circle circle-1" />
      <div class="circle circle-2" />
    </div>
    
    <div class="signup-container">
      <!-- 뒤로가기 -->
      <button class="back-to-home" @click="goToLanding">
        <ArrowLeft :size="18" />
        홈으로
      </button>
      
      <div class="signup-card">
        <!-- 로고 -->
        <div class="logo">
          <Sparkles :size="28" class="logo-icon" />
          <h1>Liquid Memo</h1>
        </div>
        
        <!-- 1단계: 이메일 입력 -->
        <Transition name="slide" mode="out-in">
          <form v-if="step === 'email'" key="email" @submit.prevent="handleSendOTP" class="form">
            <p class="form-desc">
              이메일 주소를 입력하면<br>
              인증번호를 보내드려요
            </p>
            
            <div class="input-group">
              <Mail :size="20" class="input-icon" />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
                :disabled="loading"
                autofocus
              />
            </div>
            
            <button type="submit" class="submit-btn" :disabled="loading || !email.trim()">
              <Loader2 v-if="loading" :size="20" class="spin" />
              <template v-else>
                인증번호 받기
                <ArrowRight :size="20" />
              </template>
            </button>
          </form>
          
          <!-- 2단계: OTP 입력 -->
          <form v-else key="otp" @submit.prevent="handleVerifyOTP" class="form">
            <p class="form-desc">
              <strong>{{ email }}</strong>로<br>
              인증번호를 보냈어요
            </p>
            
            <div class="input-group otp-input">
              <KeyRound :size="20" class="input-icon" />
              <input
                :value="otpCode"
                type="text"
                inputmode="numeric"
                placeholder="인증번호 6자리"
                required
                :disabled="loading"
                @input="handleOtpInput"
                autofocus
              />
            </div>
            
            <button type="submit" class="submit-btn" :disabled="loading || otpCode.length !== 6">
              <Loader2 v-if="loading" :size="20" class="spin" />
              <template v-else>
                회원가입 완료
                <ArrowRight :size="20" />
              </template>
            </button>
            
            <div class="secondary-actions">
              <button type="button" class="text-btn" @click="goBack">
                다른 이메일로 가입
              </button>
              <button type="button" class="text-btn" @click="handleSendOTP" :disabled="loading">
                인증번호 다시 받기
              </button>
            </div>
          </form>
        </Transition>
        
        <!-- 에러 메시지 -->
        <Transition name="fade">
          <p v-if="error" class="error-msg">{{ error }}</p>
        </Transition>
      </div>
      
      <p class="footer-note">
        이미 계정이 있으신가요?
        <button class="link-btn" @click="goToLogin">로그인하기</button>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signup-page {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

// 배경 장식
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.12;
  }
  
  .circle-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, var(--ink-blue), var(--ink-green));
    top: -150px;
    right: -100px;
  }
  
  .circle-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, var(--ink-amber), var(--marker-yellow));
    bottom: -100px;
    left: -100px;
  }
}

.signup-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.back-to-home {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
  padding: 8px 14px;
  font-size: 14px;
  color: var(--text-soft);
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--text-ink);
    background: var(--bg-paper);
  }
}

.signup-card {
  background: var(--bg-paper);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: var(--shadow-card);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 36px;
  
  .logo-icon {
    color: var(--ink-amber);
  }
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-ink);
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-desc {
  text-align: center;
  font-size: 15px;
  color: var(--text-soft);
  line-height: 1.5;
  
  strong {
    color: var(--text-ink);
    word-break: break-all;
  }
}

.input-group {
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-faint);
  }
  
  input {
    width: 100%;
    padding: 16px 16px 16px 50px;
    font-size: 16px;
    border: 1px solid var(--border-medium);
    border-radius: 12px;
    background: var(--bg-base);
    color: var(--text-ink);
    transition: all 0.2s;
    
    &::placeholder {
      color: var(--text-faint);
    }
    
    &:focus {
      border-color: var(--ink-blue);
      background: var(--bg-paper);
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &.otp-input input {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 8px;
    padding-left: 50px;
    padding-right: 16px;
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: var(--ink-green);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.secondary-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.text-btn {
  font-size: 13px;
  color: var(--text-soft);
  transition: color 0.2s;
  
  &:hover:not(:disabled) {
    color: var(--ink-blue);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.error-msg {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  color: var(--ink-red);
}

.footer-note {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-faint);
}

.link-btn {
  color: var(--ink-blue);
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--ink-green);
    text-decoration: underline;
  }
}

// 애니메이션: 스핀
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 애니메이션: 슬라이드
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 애니메이션: 페이드
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

