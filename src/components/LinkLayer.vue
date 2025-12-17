<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const docId = computed(() => store.currentDocId)
const docLinks = computed(() => docId.value ? store.getLinksByDoc(docId.value) : [])

const paths = computed(() => {
  return docLinks.value.map(link => {
    const from = store.cards.find(c => c.id === link.fromCardId)
    const to = store.cards.find(c => c.id === link.toCardId)
    if (!from || !to) return null
    
    const x1 = from.x + from.width / 2
    const y1 = from.y + 70
    const x2 = to.x + to.width / 2
    const y2 = to.y + 70
    
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2)
    const curve = Math.min(dist * 0.25, 80)
    
    return {
      id: link.id,
      d: `M ${x1} ${y1} Q ${mx} ${my - curve} ${x2} ${y2}`
    }
  }).filter(Boolean)
})

const remove = (id: string, e: MouseEvent) => {
  e.stopPropagation()
  store.deleteLink(id)
}
</script>

<template>
  <svg class="links">
    <defs>
      <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
        <circle cx="5" cy="5" r="4" fill="#2563eb" />
      </marker>
    </defs>
    
    <g v-for="p in paths" :key="p!.id">
      <path :d="p!.d" class="hit" @click="remove(p!.id, $event)" />
      <path :d="p!.d" class="line" marker-start="url(#dot)" marker-end="url(#dot)" />
    </g>
  </svg>
</template>

<style lang="scss" scoped>
.links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.hit {
  fill: none;
  stroke: transparent;
  stroke-width: 16px;
  cursor: pointer;
  pointer-events: stroke;
  
  &:hover + .line {
    stroke-width: 2.5px;
  }
}

.line {
  fill: none;
  stroke: var(--ink-blue);
  stroke-width: 1.5px;
  stroke-linecap: round;
  pointer-events: none;
  opacity: 0.6;
}
</style>
