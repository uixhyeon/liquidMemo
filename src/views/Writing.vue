<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import SourceEditor from '@/components/SourceEditor.vue'
import Workspace from '@/components/Workspace.vue'
import HighlightLink from '@/components/HighlightLink.vue'
import { ArrowLeft, Check, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const docId = computed(() => route.params.id as string)

watch(docId, (id) => {
  if (id) store.openDoc(id)
}, { immediate: true })

const doc = computed(() => store.currentDoc)
const project = computed(() => store.currentProject)
const category = computed(() => store.currentCategory)

const goBack = () => {
  store.closeDoc()
  router.push('/')
}

const saveAndExit = () => {
  store.saveToLocal()
  store.closeDoc()
  router.push('/')
}

const handleTitleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (doc.value) {
    store.updateDoc(doc.value.id, { title: target.value })
  }
}
</script>

<template>
  <div class="writing" v-if="doc">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="18" />
      </button>
      
      <div class="doc-info">
        <div class="breadcrumb">
          <span class="crumb" :style="{ color: category?.color }">{{ category?.name }}</span>
          <ChevronRight :size="14" class="sep" />
          <span class="crumb">{{ project?.name }}</span>
          <ChevronRight :size="14" class="sep" />
        </div>
        <input
          type="text"
          class="title-input"
          :value="doc.title"
          @input="handleTitleChange"
          placeholder="제목 입력..."
        />
      </div>
      
      <button class="save-btn" @click="saveAndExit">
        <Check :size="18" />
        저장
      </button>
    </header>
    
    <main class="main">
      <SourceEditor class="source" />
      <div class="divider" />
      <Workspace class="workspace" />
      <HighlightLink />
    </main>
  </div>
  
  <div v-else class="not-found">
    <p>문서를 찾을 수 없습니다</p>
    <button @click="goBack">돌아가기</button>
  </div>
</template>

<style lang="scss" scoped>
.writing {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding: 0 16px;
  background: var(--bg-paper);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--text-soft);
  transition: all 0.15s;
  
  &:hover {
    background: var(--bg-warm);
    color: var(--text-ink);
  }
}

.doc-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    
    .crumb {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-soft);
    }
    
    .sep {
      color: var(--text-faint);
    }
  }
  
  .title-input {
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-ink);
    min-width: 0;
    
    &::placeholder {
      color: var(--text-faint);
    }
  }
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--text-ink);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  
  &:hover {
    background: #1a1a1a;
  }
}

.main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.source { width: 45%; }
.workspace { width: calc(55% - 1px); }

.divider {
  width: 1px;
  background: var(--border-light);
  flex-shrink: 0;
}

.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-soft);
  
  button {
    padding: 8px 16px;
    background: var(--text-ink);
    color: white;
    border-radius: 6px;
    font-size: 13px;
  }
}
</style>
