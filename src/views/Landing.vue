<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const leftTexts = ['원문을 읽고', '하이라이트하고', '메모로 남기세요']
const rightTexts = ['메모들을', '연결하고', '아이디어를 완성하세요']
const items = ['하이라이트', '메모', '연결', '정리', '검색']

// 각 요소의 ref
const leftTextRefs = ref<(HTMLElement | null)[]>([])
const rightTextRefs = ref<(HTMLElement | null)[]>([])
const itemRefs = ref<(HTMLElement | null)[]>([])
const leftCircleRef = ref<HTMLElement | null>(null)
const rightCircleRef = ref<HTMLElement | null>(null)
const heroGraphicRef = ref<HTMLElement | null>(null)
const heroSubtitleRef = ref<HTMLElement | null>(null)
const heroTitleRef = ref<HTMLElement | null>(null)
const heroDescRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

onMounted(async () => {
  // DOM이 완전히 렌더링된 후 실행
  await nextTick()
  
  // Intersection Observer 설정
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  })
  
  // 각 요소 관찰 시작
  leftTextRefs.value.forEach(el => {
    if (el && observer) observer.observe(el)
  })
  rightTextRefs.value.forEach(el => {
    if (el && observer) observer.observe(el)
  })
  itemRefs.value.forEach(el => {
    if (el && observer) observer.observe(el)
  })
  if (leftCircleRef.value && observer) observer.observe(leftCircleRef.value)
  if (rightCircleRef.value && observer) observer.observe(rightCircleRef.value)
  if (heroGraphicRef.value && observer) observer.observe(heroGraphicRef.value)
  if (heroSubtitleRef.value && observer) observer.observe(heroSubtitleRef.value)
  if (heroTitleRef.value && observer) observer.observe(heroTitleRef.value)
  if (heroDescRef.value && observer) observer.observe(heroDescRef.value)
  if (bottomButtonRef.value && observer) observer.observe(bottomButtonRef.value)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="landing">
    <!-- 네비게이션 -->
    <nav class="nav">
      <div class="logo">Liquid Memo</div>
      <button class="login-btn" @click="goToLogin">로그인</button>
    </nav>
    
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <p ref="heroSubtitleRef" class="hero-subtitle">나만의 스마트한 메모</p>
          <h1 ref="heroTitleRef" class="hero-title">Liquid Memo로<br>생각을 정리하세요</h1>
          <p ref="heroDescRef" class="hero-desc">
            더 가볍게, 더 편하게, 내 일상에 꼭 맞는 메모 앱이 여기 있습니다.<br>
            새로운 하루를 열어보세요. 작지만 큰 변화가 시작됩니다.
          </p>
          <button ref="bottomButtonRef" class="hero-btn visible" @click="goToLogin">
            <ArrowRight :size="20" />
            시작하기
          </button>
        </div>
        <div class="hero-graphic">
          <div 
            ref="heroGraphicRef"
            class="graphic-circle"
          >
            <div class="graphic-inner">
              <!-- 나중에 이미지로 대체될 부분 -->
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 기능 섹션 -->
    <section class="features-section">
      <!-- 좌측 섹션 -->
      <div class="feature-item">
        <div 
          ref="leftCircleRef"
          class="feature-graphic feature-graphic-left"
        >
          <div class="circle-placeholder" />
        </div>
        <div class="feature-text">
          <h3 
            :ref="el => leftTextRefs[0] = el as HTMLElement"
            class="text-line"
          >
            {{ leftTexts[0] }}
          </h3>
          <p 
            :ref="el => leftTextRefs[1] = el as HTMLElement"
            class="text-line"
          >
            {{ leftTexts[1] }}
          </p>
          <p 
            :ref="el => leftTextRefs[2] = el as HTMLElement"
            class="text-line"
          >
            {{ leftTexts[2] }}
          </p>
        </div>
      </div>
      
      <!-- 중앙 아이템들 -->
      <div class="center-items-wrapper">
        <div 
          v-for="(item, index) in items" 
          :key="index"
          :ref="el => itemRefs[index] = el as HTMLElement"
          class="center-item"
        >
          <div class="item-graphic">
            <div class="item-circle" />
          </div>
          <div class="item-text">{{ item }}</div>
        </div>
      </div>
      
      <!-- 우측 섹션 -->
      <div class="feature-item feature-item-right">
        <div class="feature-text">
          <h3 
            :ref="el => rightTextRefs[0] = el as HTMLElement"
            class="text-line"
          >
            {{ rightTexts[0] }}
          </h3>
          <p 
            :ref="el => rightTextRefs[1] = el as HTMLElement"
            class="text-line"
          >
            {{ rightTexts[1] }}
          </p>
          <p 
            :ref="el => rightTextRefs[2] = el as HTMLElement"
            class="text-line"
          >
            {{ rightTexts[2] }}
          </p>
        </div>
        <div 
          ref="rightCircleRef"
          class="feature-graphic feature-graphic-right"
        >
          <div class="circle-placeholder" />
        </div>
      </div>
    </section>
    
    <!-- 하단 큰 타이틀과 버튼 -->
    <footer class="bottom-section">
      <h1 ref="bottomTitleRef" class="big-title">메모로 생각을 정리하세요</h1>
      <button ref="bottomButtonRef" class="start-btn" @click="goToLogin">
        지금 바로 시작하기
        <ArrowRight :size="20" />
      </button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.landing {
  width: 100%;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
}

// 네비게이션
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border-light);
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-ink);
}

.login-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-body);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-paper);
  transition: all 0.15s;
  
  &:hover {
    border-color: var(--border-medium);
  }
}

// 히어로 섹션
.hero-section {
  padding: 120px 40px;
  background: var(--bg-base);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-text {
  .hero-subtitle {
    font-size: 16px;
    color: var(--ink-blue);
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .hero-title {
    font-size: 48px;
    font-weight: 800;
    color: var(--text-ink);
    line-height: 1.3;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
  }
  
  .hero-desc {
    font-size: 18px;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 40px;
  }
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: var(--ink-green);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover {
    background: #059669;
    transform: translateY(-2px);
  }
}

.hero-graphic {
  display: flex;
  justify-content: center;
  align-items: center;
}

.graphic-circle {
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6, #8b5cf6);
  position: relative;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.8s ease, transform 0.8s ease;
  
  &.visible {
    opacity: 1;
    transform: scale(1);
  }
}

.graphic-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1), transparent 50%);
  position: relative;
  overflow: hidden;
}

// 기능 섹션
.features-section {
  padding: 100px 40px;
  background: var(--bg-base);
  max-width: 1400px;
  margin: 0 auto;
}

// 좌측/우측 섹션
.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.left-section {
  align-items: flex-end;
}

.right-section {
  align-items: flex-start;
}

.left-text,
.right-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .text-line {
    font-size: 24px;
    color: var(--text-soft);
    line-height: 1.4;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
    
    &.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    // 순차적으로 나타나도록 delay
    &:nth-child(1) { transition-delay: 0s; }
    &:nth-child(2) { transition-delay: 0.1s; }
    &:nth-child(3) { transition-delay: 0.2s; }
  }
}

.left-text {
  text-align: right;
}

.right-text {
  text-align: left;
}

// 동그라미 placeholder
.circle-placeholder {
  width: 400px;
  height: 400px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--ink-blue), var(--ink-green));
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.8s ease, transform 0.8s ease;
  
  &.visible {
    opacity: 1;
    transform: scale(1);
  }
}

// 중앙 아이템들
.center-items-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin: 80px 0;
}

.center-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: var(--bg-paper);
  border-radius: 24px;
  border: 1px solid var(--border-light);
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  // 순차적으로 나타나도록 delay
  &:nth-child(1) { transition-delay: 0s; }
  &:nth-child(2) { transition-delay: 0.1s; }
  &:nth-child(3) { transition-delay: 0.2s; }
  &:nth-child(4) { transition-delay: 0.3s; }
  &:nth-child(5) { transition-delay: 0.4s; }
}

.item-graphic {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-ink);
  text-align: center;
}

.item-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ink-amber), var(--marker-yellow));
}

// 반응형
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 60px;
  }
  
  .graphic-circle {
    width: 400px;
    height: 400px;
  }
  
  .feature-item,
  .feature-item-right {
    grid-template-columns: 1fr;
    gap: 40px;
    
    .feature-text {
      order: 2;
    }
    
    .feature-graphic {
      order: 1;
    }
  }
  
  .center-items-wrapper {
    grid-template-columns: 1fr;
  }
  
  .circle-placeholder {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .nav {
    padding: 16px 20px;
  }
  
  .main {
    padding: 40px 20px;
  }
  
  .big-title {
    font-size: 32px;
  }
  
  .center-item {
    font-size: 22px;
    padding: 20px 32px;
    min-width: 200px;
  }
  
  .item-circle {
    width: 60px;
    height: 60px;
  }
}
</style>











