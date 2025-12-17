<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const svgRef = ref<SVGSVGElement | null>(null)
const lines = ref<{ x1: number; y1: number; x2: number; y2: number; id: string }[]>([])

const docId = computed(() => store.currentDocId)
const cards = computed(() => docId.value ? store.getCardsByDoc(docId.value) : [])

// 연결선 업데이트
const updateLines = () => {
  if (!svgRef.value) return
  
  const newLines: typeof lines.value = []
  const mainEl = svgRef.value.parentElement
  if (!mainEl) return
  
  const mainRect = mainEl.getBoundingClientRect()
  
  // 원문 영역의 하이라이트된 mark 요소들 찾기
  const sourceEditor = mainEl.querySelector('.source-editor')
  const workspace = mainEl.querySelector('.workspace')
  if (!sourceEditor || !workspace) return
  
  const sourceRect = sourceEditor.getBoundingClientRect()
  const workspaceRect = workspace.getBoundingClientRect()
  
  cards.value.forEach(card => {
    if (!card.highlightId) return // 순수 메모는 연결선 없음
    
    // 해당 하이라이트의 mark 요소 찾기
    const marks = sourceEditor.querySelectorAll('mark')
    let markEl: Element | null = null
    
    // 하이라이트 ID와 매칭되는 mark 찾기 (순서 기반)
    const highlight = store.highlights.find(h => h.id === card.highlightId)
    if (!highlight) return
    
    // mark 요소 중 해당 텍스트를 포함하는 것 찾기
    marks.forEach(mark => {
      if (mark.textContent?.includes(card.quote.slice(0, 20))) {
        markEl = mark
      }
    })
    
    if (!markEl) {
      // mark를 못 찾으면 소스 에디터 오른쪽 중앙에서 시작
      const cardEl = workspace.querySelector(`[data-card-id="${card.id}"]`)
      if (!cardEl) return
      
      const cardRect = cardEl.getBoundingClientRect()
      
      newLines.push({
        id: card.id,
        x1: sourceRect.right - mainRect.left,
        y1: sourceRect.top + sourceRect.height / 2 - mainRect.top,
        x2: cardRect.left - mainRect.left,
        y2: cardRect.top + 30 - mainRect.top
      })
      return
    }
    
    const markRect = markEl.getBoundingClientRect()
    const cardEl = workspace.querySelector(`[data-card-id="${card.id}"]`)
    if (!cardEl) return
    
    const cardRect = cardEl.getBoundingClientRect()
    
    newLines.push({
      id: card.id,
      x1: markRect.right - mainRect.left,
      y1: markRect.top + markRect.height / 2 - mainRect.top,
      x2: cardRect.left - mainRect.left,
      y2: cardRect.top + 30 - mainRect.top
    })
  })
  
  lines.value = newLines
}

// 스크롤, 리사이즈 시 업데이트
let rafId: number | null = null
const scheduleUpdate = () => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    updateLines()
    rafId = null
  })
}

onMounted(() => {
  updateLines()
  
  // 스크롤 이벤트 리스너
  const mainEl = svgRef.value?.parentElement
  if (mainEl) {
    const sourceContent = mainEl.querySelector('.editor-content')
    const canvas = mainEl.querySelector('.canvas')
    
    sourceContent?.addEventListener('scroll', scheduleUpdate)
    canvas?.addEventListener('scroll', scheduleUpdate)
  }
  
  window.addEventListener('resize', scheduleUpdate)
})

onUnmounted(() => {
  window.removeEventListener('resize', scheduleUpdate)
  if (rafId) cancelAnimationFrame(rafId)
})

// 카드 변경 시 업데이트
watch([cards, () => store.cards], () => {
  setTimeout(updateLines, 50)
}, { deep: true })

// 주기적 업데이트 (카드 드래그 등)
let intervalId: number | null = null
onMounted(() => {
  intervalId = window.setInterval(updateLines, 100)
})
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <svg ref="svgRef" class="highlight-links">
    <defs>
      <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(180, 170, 155, 0.6)" />
        <stop offset="100%" stop-color="rgba(180, 170, 155, 0.2)" />
      </linearGradient>
    </defs>
    
    <path
      v-for="line in lines"
      :key="line.id"
      :d="`M ${line.x1} ${line.y1} C ${line.x1 + 40} ${line.y1}, ${line.x2 - 40} ${line.y2}, ${line.x2} ${line.y2}`"
      class="link-path"
    />
  </svg>
</template>

<style lang="scss" scoped>
.highlight-links {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.link-path {
  fill: none;
  stroke: url(#linkGradient);
  stroke-width: 1.5;
  stroke-linecap: round;
}
</style>

