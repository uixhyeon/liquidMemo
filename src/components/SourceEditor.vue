<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { useAppStore } from '@/stores/app'
import { ArrowRight } from 'lucide-vue-next'

const store = useAppStore()
const selectionRect = ref<{ x: number; y: number } | null>(null)
const hasSelection = ref(false)
const lastKeyWasSpace = ref(false)

const docId = computed(() => store.currentDocId)

// 초기 콘텐츠 가져오기
const getInitialContent = () => {
  if (docId.value && store.docContents[docId.value]) {
    return store.docContents[docId.value]
  }
  return '<p>여기에 원문을 작성하세요.</p><p></p>'
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      bulletList: false,
      orderedList: false,
      horizontalRule: false,
    }),
    Highlight.configure({ multicolor: true }),
  ],
  content: getInitialContent(),
  editorProps: {
    attributes: { class: 'editor-prose' },
    handleKeyDown: (view, event) => {
      // 스페이스 두 번 연속 입력 시 하이라이트 해제
      if (event.key === ' ') {
        if (lastKeyWasSpace.value) {
          // 하이라이트 해제
          if (editor.value?.isActive('highlight')) {
            editor.value.chain().focus().unsetHighlight().run()
          }
          lastKeyWasSpace.value = false
        } else {
          lastKeyWasSpace.value = true
        }
      } else {
        lastKeyWasSpace.value = false
      }
      return false // 기본 동작 계속
    },
  },
  onSelectionUpdate: ({ editor }) => {
    const { from, to } = editor.state.selection
    hasSelection.value = from !== to
    
    if (hasSelection.value) {
      const view = editor.view
      const end = view.coordsAtPos(to)
      selectionRect.value = { x: end.right + 8, y: end.top - 16 }
    } else {
      selectionRect.value = null
    }
  },
  onUpdate: ({ editor }) => {
    if (docId.value) {
      store.setDocContent(docId.value, editor.getJSON())
    }
  }
})

// 에디터 마운트 후 콘텐츠 로드
onMounted(() => {
  nextTick(() => {
    if (docId.value && editor.value) {
      const content = store.docContents[docId.value]
      if (content) {
        editor.value.commands.setContent(content)
      }
    }
  })
})

// 문서 변경 시 콘텐츠 로드
watch(docId, (id) => {
  if (id && editor.value) {
    const content = store.docContents[id]
    if (content) {
      editor.value.commands.setContent(content)
    } else {
      editor.value.commands.setContent('<p>여기에 원문을 작성하세요.</p><p></p>')
    }
  }
})

const sendToMemo = () => {
  if (!editor.value || !hasSelection.value || !docId.value) return
  
  const { from, to } = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(from, to, ' ').trim()
  if (!text) return
  
  const highlight = store.createHighlight(docId.value, from, to, '#fef08a')
  editor.value.chain().focus().setHighlight({ color: '#fef08a' }).run()
  store.createCard(docId.value, highlight.id, text)
  
  editor.value.commands.setTextSelection(to)
  hasSelection.value = false
  selectionRect.value = null
}
</script>

<template>
  <div class="source-editor">
    <div class="toolbar">
      <span class="label">원문</span>
    </div>
    
    <div class="editor-wrap">
      <EditorContent :editor="editor" class="editor-content" />
      
      <Transition name="pop">
        <button
          v-if="hasSelection && selectionRect"
          class="send-btn"
          :style="{ left: `${selectionRect.x}px`, top: `${selectionRect.y}px` }"
          @mousedown.prevent
          @click="sendToMemo"
        >
          메모로
          <ArrowRight :size="14" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.source-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-paper);
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-light);
  
  .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.editor-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-content {
  height: 100%;
  overflow-y: auto;
  padding: 28px 32px;
  
  :deep(.editor-prose) {
    min-height: 100%;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-ink);
    
    p { margin-bottom: 1em; }
    
    mark {
      background: var(--marker-yellow);
      color: inherit;
      padding: 2px 0;
      border-radius: 2px;
    }
  }
}

.send-btn {
  position: fixed;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--text-ink);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-float);
  
  &:hover {
    background: #1a1a1a;
  }
}

.pop-enter-active, .pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
