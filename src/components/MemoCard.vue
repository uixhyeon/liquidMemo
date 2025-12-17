<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Card } from '@/types'
import { Link2, X, Quote } from 'lucide-vue-next'

const props = defineProps<{ card: Card }>()
const store = useAppStore()

const note = ref(props.card.note)
const isDragging = ref(false)
const offset = ref({ x: 0, y: 0 })

const isSelected = computed(() => store.ui.selectedCardId === props.card.id)
const isConnecting = computed(() => store.ui.isConnecting)
const isSource = computed(() => store.ui.connectingFromCardId === props.card.id)
const hasQuote = computed(() => props.card.quote && props.card.quote.trim().length > 0)

watch(note, (v) => store.updateCard(props.card.id, { note: v }))

const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  if (isConnecting.value && !isSource.value) {
    store.finishConnecting(props.card.id)
  } else {
    store.selectCard(props.card.id)
  }
}

const startDrag = (e: MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
  isDragging.value = true
  offset.value = { x: e.clientX - props.card.x, y: e.clientY - props.card.y }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  store.updateCard(props.card.id, {
    x: Math.max(0, e.clientX - offset.value.x),
    y: Math.max(0, e.clientY - offset.value.y)
  })
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startConnect = (e: MouseEvent) => {
  e.stopPropagation()
  store.startConnecting(props.card.id)
}

const remove = (e: MouseEvent) => {
  e.stopPropagation()
  store.deleteCard(props.card.id)
}
</script>

<template>
  <div
    class="card"
    :class="{ 
      selected: isSelected, 
      dragging: isDragging, 
      target: isConnecting && !isSource, 
      source: isSource,
      'no-quote': !hasQuote
    }"
    :style="{ left: `${card.x}px`, top: `${card.y}px`, width: `${card.width}px` }"
    :data-card-id="card.id"
    @click="handleClick"
    @mousedown="startDrag"
  >
    <!-- 인용문이 있을 때만 표시 -->
    <div v-if="hasQuote" class="quote">
      <Quote :size="12" class="quote-icon" />
      {{ card.quote }}
    </div>
    
    <textarea
      v-model="note"
      class="note"
      :class="{ 'full-height': !hasQuote }"
      :placeholder="hasQuote ? '생각을 적어보세요...' : '메모를 작성하세요...'"
      @mousedown.stop
    />
    
    <div class="actions">
      <button class="action" :class="{ active: isSource }" @click="startConnect" title="연결">
        <Link2 :size="14" />
      </button>
      <button class="action del" @click="remove" title="삭제">
        <X :size="14" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--bg-paper);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  cursor: grab;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
  
  &:hover {
    border-color: var(--border-medium);
    .actions { opacity: 1; }
  }
  
  &.selected {
    border-color: var(--ink-blue);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15), var(--shadow-card);
  }
  
  &.dragging {
    cursor: grabbing;
    box-shadow: var(--shadow-float);
    z-index: 100;
  }
  
  &.target:hover {
    border-color: var(--ink-green);
    box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.15), var(--shadow-card);
  }
  
  &.source {
    border-color: var(--ink-blue);
  }
  
  // 인용문 없는 순수 메모 카드
  &.no-quote {
    border-left: 3px solid var(--ink-amber);
  }
}

.quote {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-body);
  background: var(--bg-warm);
  border-bottom: 1px solid var(--border-light);
  
  .quote-icon {
    flex-shrink: 0;
    color: var(--text-faint);
    margin-top: 2px;
  }
}

.note {
  flex: 1;
  min-height: 48px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-ink);
  resize: none;
  cursor: text;
  
  &::placeholder { color: var(--text-faint); }
  
  &.full-height {
    min-height: 80px;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
  padding: 6px 8px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-warm);
  opacity: 0;
  transition: opacity 0.15s;
  
  .action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    color: var(--text-soft);
    transition: all 0.12s;
    
    &:hover {
      color: var(--text-ink);
      background: rgba(0,0,0,0.06);
    }
    
    &.active {
      color: var(--ink-blue);
      background: rgba(37, 99, 235, 0.1);
    }
    
    &.del:hover {
      color: var(--ink-red);
      background: rgba(220, 38, 38, 0.1);
    }
  }
}
</style>
