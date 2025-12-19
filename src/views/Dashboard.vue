<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { STATUS_LABELS } from '@/types'
import type { DocStatus } from '@/types'
import { 
  Plus, FolderOpen, Folder, FileText, 
  Trash2, ChevronRight, ChevronDown, MoreVertical,
  ExternalLink, Info, Copy, Palette, Pencil, CornerDownLeft, LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { CATEGORY_COLORS, PROJECT_COLORS } from '@/types'

const router = useRouter()
const store = useAppStore()
const auth = useAuthStore()

// 로그아웃
const handleLogout = async () => {
  await auth.logout()
  router.push('/')
}

// 선택 상태
const selectedCategoryId = ref<string | null>(null)
const selectedProjectId = ref<string | null>(null)
const expandedCategories = ref<Set<string>>(new Set())

// 입력 상태
const newCategoryName = ref('')
const newProjectName = ref('')
const showNewCategory = ref(false)
const showNewProject = ref(false)

// 정렬 상태: 'created' | 'updated'
const sortBy = ref<'created' | 'updated'>('updated')

// 드롭다운 메뉴 상태
const openMenuId = ref<string | null>(null)
const openCategoryMenuId = ref<string | null>(null)
const openProjectMenuId = ref<string | null>(null)

// 색상 선택 모달
const showColorPicker = ref(false)
const colorPickerTarget = ref<{ type: 'category' | 'project', id: string } | null>(null)
const colorPickerColors = ref<string[]>([])

// 이름 변경 모달
const showRenameModal = ref(false)
const renameTarget = ref<{ type: 'category' | 'project', id: string, name: string } | null>(null)
const newName = ref('')

const statuses: DocStatus[] = ['draft', 'progress', 'done']

// 선택된 항목들
const selectedCategory = computed(() => 
  store.categories.find(c => c.id === selectedCategoryId.value)
)

const selectedProject = computed(() => 
  store.projects.find(p => p.id === selectedProjectId.value)
)

// 선택된 프로젝트의 문서들 (정렬 적용)
const projectDocs = computed(() => {
  if (!selectedProjectId.value) return []
  const docs = [...store.docs.filter(d => d.projectId === selectedProjectId.value)]
  
  if (sortBy.value === 'created') {
    return docs.sort((a, b) => b.createdAt - a.createdAt)
  } else {
    return docs.sort((a, b) => b.updatedAt - a.updatedAt)
  }
})

// 첫 카테고리 자동 선택 및 확장
if (store.categories.length > 0 && !selectedCategoryId.value) {
  selectedCategoryId.value = store.categories[0].id
  expandedCategories.value.add(store.categories[0].id)
  const firstProjects = store.getProjectsByCategory(store.categories[0].id)
  if (firstProjects.length > 0) {
    selectedProjectId.value = firstProjects[0].id
  }
}

// 카테고리 토글
const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
  selectedCategoryId.value = categoryId
}

// 프로젝트 선택
const selectProject = (projectId: string, categoryId: string) => {
  selectedProjectId.value = projectId
  selectedCategoryId.value = categoryId
}

// ProseMirror JSON에서 텍스트 추출
const extractText = (content: any): string => {
  if (!content) return ''
  let text = ''
  const extract = (node: any) => {
    if (node.text) text += node.text
    if (node.content) {
      node.content.forEach((child: any) => {
        extract(child)
        if (child.type === 'paragraph') text += ' '
      })
    }
  }
  extract(content)
  return text.trim()
}

const getPreview = (docId: string): string => {
  const content = store.docContents[docId]
  const text = extractText(content)
  if (!text) return '내용 없음'
  return text.length > 100 ? text.slice(0, 100) + '...' : text
}

// 상태 변경
const changeStatus = (docId: string, status: DocStatus, e: Event) => {
  e.stopPropagation()
  store.updateDocStatus(docId, status)
}

// 카테고리 생성
const handleCreateCategory = () => {
  if (!newCategoryName.value.trim()) return
  const category = store.createCategory(newCategoryName.value.trim())
  selectedCategoryId.value = category.id
  expandedCategories.value.add(category.id)
  newCategoryName.value = ''
  showNewCategory.value = false
}

// 프로젝트 생성
const handleCreateProject = () => {
  if (!newProjectName.value.trim() || !selectedCategoryId.value) return
  const project = store.createProject(selectedCategoryId.value, newProjectName.value.trim())
  selectedProjectId.value = project.id
  newProjectName.value = ''
  showNewProject.value = false
}

// 문서 생성
const handleCreateDoc = () => {
  if (!selectedProjectId.value) return
  const doc = store.createDoc(selectedProjectId.value)
  router.push(`/write/${doc.id}`)
}

// 문서 열기
const openDoc = (docId: string) => {
  router.push(`/write/${docId}`)
}

// 삭제
const handleDeleteCategory = (categoryId: string, e: Event) => {
  e.stopPropagation()
  if (confirm('이 카테고리와 모든 하위 항목을 삭제할까요?')) {
    store.deleteCategory(categoryId)
    if (selectedCategoryId.value === categoryId) {
      selectedCategoryId.value = store.categories[0]?.id || null
      selectedProjectId.value = null
    }
  }
}

const handleDeleteProject = (projectId: string, e: Event) => {
  e.stopPropagation()
  if (confirm('이 프로젝트와 모든 문서를 삭제할까요?')) {
    store.deleteProject(projectId)
    if (selectedProjectId.value === projectId) {
      selectedProjectId.value = null
    }
  }
}

const handleDeleteDoc = (docId: string, e: Event) => {
  e.stopPropagation()
  if (confirm('이 문서를 삭제할까요?')) {
    store.deleteDoc(docId)
  }
}

// 상세정보 모달
const showInfoModal = ref(false)
const infoDoc = ref<typeof store.docs[0] | null>(null)

const showDocInfo = (doc: typeof store.docs[0]) => {
  infoDoc.value = doc
  showInfoModal.value = true
}

const closeInfoModal = () => {
  showInfoModal.value = false
  infoDoc.value = null
}

// 문서 복제
const duplicateDoc = (docId: string) => {
  const original = store.docs.find(d => d.id === docId)
  if (!original) return
  
  const newDoc = store.createDoc(original.projectId, `${original.title} (복사본)`)
  const content = store.docContents[docId]
  if (content) {
    store.setDocContent(newDoc.id, JSON.parse(JSON.stringify(content)))
  }
  store.updateDoc(newDoc.id, { status: original.status })
}

// 메뉴 외부 클릭 시 닫기
const closeMenu = () => {
  openMenuId.value = null
  openCategoryMenuId.value = null
  openProjectMenuId.value = null
}

// 카테고리 색상 변경
const openCategoryColorPicker = (categoryId: string) => {
  colorPickerTarget.value = { type: 'category', id: categoryId }
  colorPickerColors.value = CATEGORY_COLORS
  showColorPicker.value = true
  openCategoryMenuId.value = null
}

// 프로젝트 색상 변경
const openProjectColorPicker = (projectId: string) => {
  colorPickerTarget.value = { type: 'project', id: projectId }
  colorPickerColors.value = PROJECT_COLORS
  showColorPicker.value = true
  openProjectMenuId.value = null
}

// 색상 선택
const selectColor = (color: string) => {
  if (!colorPickerTarget.value) return
  
  if (colorPickerTarget.value.type === 'category') {
    store.updateCategory(colorPickerTarget.value.id, { color })
  } else {
    store.updateProject(colorPickerTarget.value.id, { color })
  }
  
  showColorPicker.value = false
  colorPickerTarget.value = null
}

// 이름 변경 모달 열기
const openRenameModal = (type: 'category' | 'project', id: string, currentName: string) => {
  renameTarget.value = { type, id, name: currentName }
  newName.value = currentName
  showRenameModal.value = true
  openCategoryMenuId.value = null
  openProjectMenuId.value = null
}

// 이름 변경 저장
const saveRename = () => {
  if (!renameTarget.value || !newName.value.trim()) return
  
  if (renameTarget.value.type === 'category') {
    store.updateCategory(renameTarget.value.id, { name: newName.value.trim() })
  } else {
    store.updateProject(renameTarget.value.id, { name: newName.value.trim() })
  }
  
  showRenameModal.value = false
  renameTarget.value = null
  newName.value = ''
}

// 카테고리 삭제 (메뉴에서)
const deleteCategoryFromMenu = (categoryId: string) => {
  openCategoryMenuId.value = null
  if (confirm('이 대분류와 모든 하위 항목을 삭제할까요?')) {
    store.deleteCategory(categoryId)
    if (selectedCategoryId.value === categoryId) {
      selectedCategoryId.value = store.categories[0]?.id || null
      selectedProjectId.value = null
    }
  }
}

// 프로젝트 삭제 (메뉴에서)
const deleteProjectFromMenu = (projectId: string) => {
  openProjectMenuId.value = null
  if (confirm('이 중분류와 모든 문서를 삭제할까요?')) {
    store.deleteProject(projectId)
    if (selectedProjectId.value === projectId) {
      selectedProjectId.value = null
    }
  }
}

// 날짜/시간 포맷
const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}.${month}.${day} ${hours}:${minutes}`
}
</script>

<template>
  <div class="dashboard" @click="closeMenu">
    <!-- 사이드바: 카테고리 + 프로젝트 트리 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">Liquid Memo</h1>
        <button class="logout-btn" @click="handleLogout" title="로그아웃">
          <LogOut :size="18" />
        </button>
      </div>
      
      <div class="tree">
        <div class="section-header">
          <span>분류</span>
          <button class="icon-btn" @click="showNewCategory = true" title="새 카테고리">
            <Plus :size="16" />
          </button>
        </div>
        
        <!-- 새 카테고리 입력 -->
        <div v-if="showNewCategory" class="new-input">
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="대분류 이름"
            @keyup.enter="handleCreateCategory"
            @keyup.esc="showNewCategory = false"
            autofocus
          />
          <button class="enter-btn" @click="handleCreateCategory" title="확인 (Enter)">
            <CornerDownLeft :size="14" />
          </button>
        </div>
        
        <!-- 카테고리 트리 -->
        <div v-for="category in store.categories" :key="category.id" class="category-group">
          <!-- 카테고리 (대분류) -->
          <div 
            :class="['category-item', { active: selectedCategoryId === category.id }]"
            @click="toggleCategory(category.id)"
          >
            <ChevronRight 
              :size="14" 
              :class="['chevron', { expanded: expandedCategories.has(category.id) }]" 
            />
            <Folder :size="16" class="category-icon" />
            <span class="name">{{ category.name }}</span>
            
            <div class="item-menu" @click.stop>
              <button class="menu-trigger" @click="openCategoryMenuId = openCategoryMenuId === category.id ? null : category.id">
                <MoreVertical :size="14" />
              </button>
              
                <Transition name="dropdown">
                <div v-if="openCategoryMenuId === category.id" class="dropdown-menu small">
                  <button class="menu-item" @click="openRenameModal('category', category.id, category.name)">
                    <Pencil :size="14" />
                    이름 변경
                  </button>
                  <div class="menu-divider" />
                  <button class="menu-item danger" @click="deleteCategoryFromMenu(category.id)">
                    <Trash2 :size="14" />
                    삭제
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          
          <!-- 프로젝트 목록 (중분류) -->
          <div v-if="expandedCategories.has(category.id)" class="projects-list">
            <div
              v-for="project in store.getProjectsByCategory(category.id)"
              :key="project.id"
              :class="['project-item', { active: selectedProjectId === project.id }]"
              @click="selectProject(project.id, category.id)"
            >
              <span class="color-dot" :style="{ background: project.color }" />
              <span class="name">{{ project.name }}</span>
              <span class="count">{{ store.getDocsByProject(project.id).length }}</span>
              
              <div class="item-menu" @click.stop>
                <button class="menu-trigger" @click="openProjectMenuId = openProjectMenuId === project.id ? null : project.id">
                  <MoreVertical :size="14" />
                </button>
                
                <Transition name="dropdown">
                  <div v-if="openProjectMenuId === project.id" class="dropdown-menu small">
                    <button class="menu-item" @click="openRenameModal('project', project.id, project.name)">
                      <Pencil :size="14" />
                      이름 변경
                    </button>
                    <button class="menu-item" @click="openProjectColorPicker(project.id)">
                      <Palette :size="14" />
                      색상 변경
                    </button>
                    <div class="menu-divider" />
                    <button class="menu-item danger" @click="deleteProjectFromMenu(project.id)">
                      <Trash2 :size="14" />
                      삭제
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
            
            <!-- 새 프로젝트 버튼 -->
            <button 
              v-if="!showNewProject || selectedCategoryId !== category.id"
              class="add-project-btn"
              @click="selectedCategoryId = category.id; showNewProject = true"
            >
              <Plus :size="14" />
              중분류 추가
            </button>
            
            <!-- 새 프로젝트 입력 -->
            <div v-if="showNewProject && selectedCategoryId === category.id" class="new-input nested">
              <input
                v-model="newProjectName"
                type="text"
                placeholder="중분류 이름"
                @keyup.enter="handleCreateProject"
                @keyup.esc="showNewProject = false"
                autofocus
              />
              <button class="enter-btn" @click="handleCreateProject" title="확인 (Enter)">
                <CornerDownLeft :size="14" />
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="store.categories.length === 0" class="empty-tree">
          대분류를 만들어보세요
        </div>
      </div>
    </aside>
    
    <!-- 메인: 문서 목록 -->
    <main class="main">
      <header class="main-header">
        <div class="title-area">
          <div class="breadcrumb">
            <span v-if="selectedCategory" class="crumb" :style="{ color: selectedCategory.color }">
              {{ selectedCategory.name }}
            </span>
            <ChevronRight v-if="selectedProject" :size="16" class="crumb-sep" />
            <span v-if="selectedProject" class="crumb project-crumb">
              <span class="color-dot" :style="{ background: selectedProject.color }" />
              {{ selectedProject.name }}
            </span>
          </div>
        </div>
        
        <div class="header-actions" v-if="selectedProjectId">
          <div class="sort-toggle">
            <button 
              :class="['sort-btn', { active: sortBy === 'created' }]"
              @click="sortBy = 'created'"
            >
              생성순
            </button>
            <button 
              :class="['sort-btn', { active: sortBy === 'updated' }]"
              @click="sortBy = 'updated'"
            >
              수정순
            </button>
          </div>
          
          <button class="new-doc-btn" @click="handleCreateDoc">
            <Plus :size="18" />
            새 문서
          </button>
        </div>
      </header>
      
      <div class="doc-list">
        <!-- 문서 카드들 -->
        <div
          v-for="doc in projectDocs"
          :key="doc.id"
          class="doc-card"
          @click="openDoc(doc.id)"
        >
          <div class="doc-icon">
            <FileText :size="20" />
          </div>
          <div class="doc-info">
            <div class="doc-header">
              <h3 class="doc-title">{{ doc.title || '제목 없음' }}</h3>
              <div class="status-toggle" @click.stop>
                <button
                  v-for="s in statuses"
                  :key="s"
                  :class="['toggle-btn', { active: doc.status === s }]"
                  @click="changeStatus(doc.id, s, $event)"
                >
                  {{ STATUS_LABELS[s] }}
                </button>
              </div>
            </div>
            <p class="doc-preview">{{ getPreview(doc.id) }}</p>
            <div class="doc-meta">
              <span class="date">{{ formatDateTime(doc.createdAt) }}</span>
              <span class="sep">·</span>
              <span class="edited">(수정 {{ formatDateTime(doc.updatedAt) }})</span>
            </div>
          </div>
          <div class="doc-actions" @click.stop>
            <button class="menu-btn" @click="openMenuId = openMenuId === doc.id ? null : doc.id">
              <MoreVertical :size="18" />
            </button>
            
            <Transition name="dropdown">
              <div v-if="openMenuId === doc.id" class="dropdown-menu">
                <button class="menu-item" @click="openDoc(doc.id); openMenuId = null">
                  <ExternalLink :size="16" />
                  열기
                </button>
                <button class="menu-item" @click="showDocInfo(doc); openMenuId = null">
                  <Info :size="16" />
                  상세정보
                </button>
                <button class="menu-item" @click="duplicateDoc(doc.id); openMenuId = null">
                  <Copy :size="16" />
                  복제
                </button>
                <div class="menu-divider" />
                <button class="menu-item danger" @click="handleDeleteDoc(doc.id, $event); openMenuId = null">
                  <Trash2 :size="16" />
                  삭제
                </button>
              </div>
            </Transition>
          </div>
        </div>
        
        <!-- 빈 상태 -->
        <div v-if="projectDocs.length === 0 && selectedProjectId" class="empty-docs">
          <FileText :size="48" />
          <p>아직 문서가 없습니다</p>
          <button @click="handleCreateDoc">
            <Plus :size="16" />
            첫 문서 만들기
          </button>
        </div>
        
        <!-- 프로젝트 미선택 -->
        <div v-if="!selectedProjectId" class="no-project">
          <FolderOpen :size="48" />
          <p>중분류를 선택하세요</p>
        </div>
      </div>
    </main>
    
    <!-- 색상 선택 모달 -->
    <Transition name="modal">
      <div v-if="showColorPicker" class="modal-overlay" @click="showColorPicker = false">
        <div class="modal-content color-picker-modal" @click.stop>
          <h2 class="modal-title">색상 선택</h2>
          <div class="color-grid">
            <button
              v-for="color in colorPickerColors"
              :key="color"
              class="color-option"
              :style="{ background: color }"
              @click="selectColor(color)"
            />
          </div>
          <button class="modal-close" @click="showColorPicker = false">취소</button>
        </div>
      </div>
    </Transition>
    
    <!-- 이름 변경 모달 -->
    <Transition name="modal">
      <div v-if="showRenameModal" class="modal-overlay" @click="showRenameModal = false">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">이름 변경</h2>
          <input
            v-model="newName"
            type="text"
            class="rename-input"
            placeholder="새 이름 입력"
            @keyup.enter="saveRename"
            autofocus
          />
          <div class="modal-actions">
            <button class="modal-cancel" @click="showRenameModal = false">취소</button>
            <button class="modal-save" @click="saveRename">저장</button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- 상세정보 모달 -->
    <Transition name="modal">
      <div v-if="showInfoModal && infoDoc" class="modal-overlay" @click="closeInfoModal">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">문서 상세정보</h2>
          
          <div class="info-row">
            <span class="info-label">제목</span>
            <span class="info-value">{{ infoDoc.title || '제목 없음' }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">상태</span>
            <span class="info-value">{{ STATUS_LABELS[infoDoc.status] }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">생성일</span>
            <span class="info-value">{{ formatDateTime(infoDoc.createdAt) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">수정일</span>
            <span class="info-value">{{ formatDateTime(infoDoc.updatedAt) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">문서 ID</span>
            <span class="info-value mono">{{ infoDoc.id }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">메모 수</span>
            <span class="info-value">{{ store.cards.filter(c => c.docId === infoDoc.id).length }}개</span>
          </div>
          
          <button class="modal-close" @click="closeInfoModal">닫기</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background: var(--bg-base);
}

// 사이드바
.sidebar {
  width: 280px;
  background: var(--bg-paper);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .logo {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-ink);
    letter-spacing: -0.02em;
  }
  
  .logout-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--text-soft);
    transition: all 0.15s;
    
    &:hover {
      background: var(--bg-warm);
      color: var(--ink-red);
    }
  }
}

.tree {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 8px;
  
  span {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .icon-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--text-soft);
    
    &:hover {
      background: var(--bg-muted);
      color: var(--text-ink);
    }
  }
}

.new-input {
  padding: 6px 8px;
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
  
  &.nested {
    padding-left: 32px;
  }
  
  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-medium);
    border-radius: 6px;
    font-size: 13px;
    background: var(--bg-paper);
    
    &:focus {
      border-color: var(--ink-blue);
    }
  }
  
  .enter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--bg-muted);
    color: var(--text-soft);
    border-radius: 6px;
    flex-shrink: 0;
    transition: all 0.15s;
    
    &:hover {
      background: var(--border-medium);
      color: var(--text-ink);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.category-group {
  margin-bottom: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  
  &:hover {
    background: var(--bg-warm);
    .item-menu .menu-trigger { opacity: 1; }
  }
  
  &.active {
    background: var(--bg-muted);
  }
  
  .category-icon {
    flex-shrink: 0;
    color: #333;
  }
  
  .chevron {
    color: var(--text-faint);
    transition: transform 0.15s;
    flex-shrink: 0;
    
    &.expanded {
      transform: rotate(90deg);
    }
  }
  
  .category-icon {
    color: var(--text-soft);
    flex-shrink: 0;
  }
  
  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-ink);
  }
  
}

.item-menu {
  position: relative;
  margin-left: auto;
  
  .menu-trigger {
    opacity: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--text-soft);
    transition: all 0.15s;
    
    &:hover {
      background: var(--bg-muted);
      color: var(--text-ink);
    }
  }
  
  .dropdown-menu.small {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    min-width: 120px;
    background: var(--bg-paper);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    box-shadow: var(--shadow-float);
    padding: 4px;
    z-index: 200;
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 10px;
      font-size: 12px;
      color: var(--text-body);
      border-radius: 4px;
      
      &:hover {
        background: var(--bg-warm);
        color: var(--text-ink);
      }
      
      &.danger {
        color: var(--ink-red);
        &:hover { background: rgba(220, 38, 38, 0.1); }
      }
    }
    
    .menu-divider {
      height: 1px;
      background: var(--border-light);
      margin: 4px 0;
    }
  }
}

.projects-list {
  padding-left: 24px;
  margin-top: 2px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-soft);
  transition: all 0.15s;
  
  &:hover {
    background: var(--bg-warm);
    color: var(--text-body);
    .item-menu .menu-trigger { opacity: 1; }
  }
  
  &.active {
    background: var(--bg-muted);
    color: var(--text-ink);
  }
  
  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .name {
    flex: 1;
    font-size: 13px;
  }
  
  .count {
    font-size: 11px;
    color: var(--text-faint);
    padding: 1px 6px;
    background: var(--bg-warm);
    border-radius: 8px;
  }
  
}

.add-project-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text-faint);
  transition: color 0.15s;
  
  &:hover {
    color: var(--text-soft);
  }
}

.empty-tree {
  padding: 20px;
  text-align: center;
  color: var(--text-faint);
  font-size: 13px;
}

// 메인
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: var(--bg-paper);
  border-bottom: 1px solid var(--border-light);
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    
    .crumb {
      font-weight: 600;
      color: var(--text-ink);
    }
    
    .project-crumb {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
    
    .crumb-sep {
      color: var(--text-faint);
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .sort-toggle {
    display: flex;
    background: var(--bg-muted);
    border-radius: 6px;
    padding: 2px;
    
    .sort-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-faint);
      border-radius: 4px;
      transition: all 0.15s;
      
      &:hover { color: var(--text-soft); }
      
      &.active {
        background: var(--bg-paper);
        color: var(--text-ink);
        box-shadow: var(--shadow-soft);
      }
    }
  }
  
  .new-doc-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--text-ink);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    
    &:hover {
      background: #1a1a1a;
    }
  }
}

.doc-list {
  flex: 1;
  padding: 20px 28px;
  overflow-y: auto;
}

.doc-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: var(--bg-paper);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    border-color: var(--border-medium);
    box-shadow: var(--shadow-soft);
    .menu-btn { opacity: 1; }
  }
  
  .doc-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-warm);
    border-radius: 8px;
    color: var(--text-soft);
    flex-shrink: 0;
  }
  
  .doc-info {
    flex: 1;
    min-width: 0;
  }
  
  .doc-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  
  .doc-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status-toggle {
    display: flex;
    background: var(--bg-muted);
    border-radius: 6px;
    padding: 2px;
    flex-shrink: 0;
    
    .toggle-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-faint);
      border-radius: 4px;
      transition: all 0.15s;
      
      &:hover { color: var(--text-soft); }
      
      &.active {
        background: var(--bg-paper);
        color: var(--text-ink);
        box-shadow: var(--shadow-soft);
      }
    }
  }
  
  .doc-preview {
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .doc-meta {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    .date { color: var(--text-soft); }
    .sep { color: var(--text-faint); }
    .edited { color: var(--text-faint); }
  }
  
  .doc-actions {
    position: relative;
    flex-shrink: 0;
  }
  
  .menu-btn {
    opacity: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--text-soft);
    transition: all 0.15s;
    
    &:hover {
      background: var(--bg-muted);
      color: var(--text-ink);
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    min-width: 140px;
    background: var(--bg-paper);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    box-shadow: var(--shadow-float);
    padding: 4px;
    z-index: 100;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-body);
    border-radius: 6px;
    transition: all 0.1s;
    
    &:hover {
      background: var(--bg-warm);
      color: var(--text-ink);
    }
    
    &.danger {
      color: var(--ink-red);
      
      &:hover {
        background: rgba(220, 38, 38, 0.1);
      }
    }
  }
  
  .menu-divider {
    height: 1px;
    background: var(--border-light);
    margin: 4px 0;
  }
}

// 드롭다운 애니메이션
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.empty-docs, .no-project {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-faint);
  
  p { margin: 16px 0; font-size: 14px; }
  
  button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    background: var(--text-ink);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    
    &:hover { background: #1a1a1a; }
  }
}

// 모달
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-paper);
  border-radius: 12px;
  padding: 24px;
  min-width: 360px;
  max-width: 90vw;
  box-shadow: var(--shadow-float);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-ink);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
  
  &:last-of-type {
    border-bottom: none;
  }
}

.info-label {
  font-size: 13px;
  color: var(--text-soft);
}

.info-value {
  font-size: 13px;
  color: var(--text-ink);
  font-weight: 500;
  
  &.mono {
    font-family: monospace;
    font-size: 12px;
    color: var(--text-soft);
  }
}

.modal-close {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  background: var(--bg-muted);
  color: var(--text-body);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  
  &:hover {
    background: var(--bg-warm);
    color: var(--text-ink);
  }
}

// 색상 선택 모달
.color-picker-modal {
  .color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  
  .color-option {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    
    &:hover {
      transform: scale(1.15);
      border-color: rgba(0, 0, 0, 0.2);
    }
  }
}

// 이름 변경 모달
.rename-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    border-color: var(--ink-blue);
    outline: none;
  }
}

.modal-actions {
  display: flex;
  gap: 10px;
  
  button {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s;
  }
  
  .modal-cancel {
    background: var(--bg-muted);
    color: var(--text-body);
    
    &:hover {
      background: var(--bg-warm);
    }
  }
  
  .modal-save {
    background: var(--text-ink);
    color: white;
    
    &:hover {
      background: #1a1a1a;
    }
  }
}

// 모달 애니메이션
.modal-enter-active, .modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  
  .modal-content {
    transform: scale(0.95);
  }
}
</style>
