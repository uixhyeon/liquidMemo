<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import MemoCard from '@/components/MemoCard.vue'
import LinkLayer from '@/components/LinkLayer.vue'
import { Plus } from 'lucide-vue-next'

const store = useAppStore()

const docId = computed(() => store.currentDocId)
const cards = computed(() => docId.value ? store.getCardsByDoc(docId.value) : [])
const hasCards = computed(() => cards.value.length > 0)

const handleClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('canvas')) {
    store.selectCard(null)
    if (store.ui.isConnecting) store.finishConnecting()
  }
}

// 새 메모 추가
const addMemo = () => {
  if (docId.value) {
    store.createMemoCard(docId.value)
  }
}
</script>

<template>
  <div class="workspace">
    <div class="toolbar">
      <span class="label">메모</span>
      <span class="count">{{ cards.length }}</span>
      <button class="add-btn" @click="addMemo" title="새 메모">
        <Plus :size="16" />
      </button>
    </div>
    
    <div class="canvas" @click="handleClick">
      <LinkLayer />
      
      <div v-if="!hasCards" class="empty">
        <p>원문에서 텍스트를 선택하거나<br><strong>+ 버튼</strong>을 눌러 메모를 만드세요</p>
      </div>
      
      <MemoCard v-for="card in cards" :key="card.id" :card="card" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-warm);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-paper);
  border-bottom: 1px solid var(--border-light);
  
  .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .count {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-faint);
    background: var(--bg-muted);
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .add-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    color: var(--text-soft);
    transition: all 0.15s;
    
    &:hover {
      background: var(--bg-muted);
      color: var(--text-ink);
    }
  }
}

.canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  background-image: radial-gradient(var(--border-medium) 1px, transparent 1px);
  background-size: 20px 20px;
}

.empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-faint);
  font-size: 14px;
  line-height: 1.7;
  pointer-events: none;
  
  strong {
    color: var(--text-soft);
  }
}
</style>
