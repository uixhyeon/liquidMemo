import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, Project, Doc, DocStatus, Highlight, Card, Link, SaveData, UIState } from '@/types'
import { CATEGORY_COLORS, PROJECT_COLORS } from '@/types'

// 간단한 ID 생성
const uid = () => crypto.randomUUID().slice(0, 8)

const STORAGE_KEY = 'liquid-memo-v3'

export const useAppStore = defineStore('app', () => {
  // === State ===
  const categories = ref<Category[]>([])
  const projects = ref<Project[]>([])
  const docs = ref<Doc[]>([])
  const docContents = ref<Record<string, any>>({})
  const highlights = ref<Highlight[]>([])
  const cards = ref<Card[]>([])
  const links = ref<Link[]>([])
  
  const currentDocId = ref<string | null>(null)
  const ui = ref<UIState>({
    selectedCardId: null,
    isConnecting: false,
    connectingFromCardId: null
  })

  // === Getters ===
  const currentDoc = computed(() => 
    docs.value.find(d => d.id === currentDocId.value)
  )
  
  const currentProject = computed(() => 
    projects.value.find(p => p.id === currentDoc.value?.projectId)
  )

  const currentCategory = computed(() =>
    categories.value.find(c => c.id === currentProject.value?.categoryId)
  )

  const getProjectsByCategory = computed(() => (categoryId: string) =>
    projects.value.filter(p => p.categoryId === categoryId)
  )

  const getDocsByProject = computed(() => (projectId: string) =>
    docs.value
      .filter(d => d.projectId === projectId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  )

  const getHighlightsByDoc = computed(() => (docId: string) =>
    highlights.value.filter(h => h.docId === docId)
  )

  const getCardsByDoc = computed(() => (docId: string) =>
    cards.value.filter(c => c.docId === docId)
  )

  const getLinksByDoc = computed(() => (docId: string) =>
    links.value.filter(l => l.docId === docId)
  )

  // === Category Actions ===
  function createCategory(name: string): Category {
    const usedColors = categories.value.map(c => c.color)
    const availableColor = CATEGORY_COLORS.find(c => !usedColors.includes(c)) || CATEGORY_COLORS[0]
    
    const category: Category = {
      id: `cat_${uid()}`,
      name,
      color: availableColor,
      createdAt: Date.now()
    }
    categories.value.push(category)
    saveToLocal()
    return category
  }

  function updateCategory(id: string, updates: Partial<Category>) {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...updates }
      saveToLocal()
    }
  }

  function deleteCategory(id: string) {
    // 해당 카테고리의 프로젝트들도 삭제
    const projectIds = projects.value.filter(p => p.categoryId === id).map(p => p.id)
    projectIds.forEach(projectId => deleteProject(projectId))
    categories.value = categories.value.filter(c => c.id !== id)
    saveToLocal()
  }

  // === Project Actions ===
  function createProject(categoryId: string, name: string): Project {
    // 같은 카테고리 내에서 사용된 색상 제외
    const usedColors = projects.value
      .filter(p => p.categoryId === categoryId)
      .map(p => p.color)
    
    // 사용 가능한 색상 중 랜덤 선택
    const availableColors = PROJECT_COLORS.filter(c => !usedColors.includes(c))
    const color = availableColors.length > 0 
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]
    
    const project: Project = {
      id: `p_${uid()}`,
      categoryId,
      name,
      color,
      createdAt: Date.now()
    }
    projects.value.push(project)
    saveToLocal()
    return project
  }

  function updateProject(id: string, updates: Partial<Project>) {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      projects.value[idx] = { ...projects.value[idx], ...updates }
      saveToLocal()
    }
  }

  function deleteProject(id: string) {
    // 해당 프로젝트의 문서들도 삭제
    const docIds = docs.value.filter(d => d.projectId === id).map(d => d.id)
    docIds.forEach(docId => deleteDoc(docId))
    projects.value = projects.value.filter(p => p.id !== id)
    saveToLocal()
  }

  // === Doc Actions ===
  function createDoc(projectId: string, title: string = '새 문서'): Doc {
    const doc: Doc = {
      id: `d_${uid()}`,
      projectId,
      title,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    docs.value.push(doc)
    saveToLocal()
    return doc
  }

  function updateDoc(id: string, updates: Partial<Doc>) {
    const idx = docs.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      docs.value[idx] = { 
        ...docs.value[idx], 
        ...updates,
        updatedAt: Date.now()
      }
      saveToLocal()
    }
  }

  // 상태만 변경 (수정시간 업데이트 안함)
  function updateDocStatus(id: string, status: DocStatus) {
    const idx = docs.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      docs.value[idx].status = status
      saveToLocal()
    }
  }

  function deleteDoc(id: string) {
    highlights.value = highlights.value.filter(h => h.docId !== id)
    cards.value = cards.value.filter(c => c.docId !== id)
    links.value = links.value.filter(l => l.docId !== id)
    delete docContents.value[id]
    docs.value = docs.value.filter(d => d.id !== id)
    saveToLocal()
  }

  function setDocContent(docId: string, content: any) {
    docContents.value[docId] = content
    updateDoc(docId, {})
  }

  function openDoc(docId: string) {
    currentDocId.value = docId
    ui.value.selectedCardId = null
    ui.value.isConnecting = false
    ui.value.connectingFromCardId = null
  }

  function closeDoc() {
    currentDocId.value = null
  }

  // === Highlight Actions ===
  function createHighlight(docId: string, from: number, to: number, color: string = '#fef08a'): Highlight {
    const highlight: Highlight = {
      id: `h_${uid()}`,
      docId,
      from,
      to,
      color,
      linkedCardIds: []
    }
    highlights.value.push(highlight)
    saveToLocal()
    return highlight
  }

  // === Card Actions ===
  function createCard(docId: string, highlightId: string | null, quote: string): Card {
    const existingCards = cards.value.filter(c => c.docId === docId)
    const card: Card = {
      id: `c_${uid()}`,
      docId,
      highlightId: highlightId || '',
      quote,
      note: '',
      x: 20 + (existingCards.length % 3) * 280,
      y: 20 + Math.floor(existingCards.length / 3) * 180,
      width: 260,
      height: 150,
      createdAt: Date.now()
    }
    cards.value.push(card)
    
    if (highlightId) {
      const highlight = highlights.value.find(h => h.id === highlightId)
      if (highlight) {
        highlight.linkedCardIds.push(card.id)
      }
    }
    
    saveToLocal()
    return card
  }

  function createMemoCard(docId: string): Card {
    return createCard(docId, null, '')
  }

  function updateCard(cardId: string, updates: Partial<Card>) {
    const idx = cards.value.findIndex(c => c.id === cardId)
    if (idx !== -1) {
      cards.value[idx] = { ...cards.value[idx], ...updates }
      saveToLocal()
    }
  }

  function deleteCard(cardId: string) {
    const card = cards.value.find(c => c.id === cardId)
    if (card) {
      const highlight = highlights.value.find(h => h.id === card.highlightId)
      if (highlight) {
        highlight.linkedCardIds = highlight.linkedCardIds.filter(id => id !== cardId)
        if (highlight.linkedCardIds.length === 0) {
          highlights.value = highlights.value.filter(h => h.id !== highlight.id)
        }
      }
    }
    links.value = links.value.filter(l => l.fromCardId !== cardId && l.toCardId !== cardId)
    cards.value = cards.value.filter(c => c.id !== cardId)
    saveToLocal()
  }

  // === Link Actions ===
  function createLink(docId: string, fromCardId: string, toCardId: string): Link | null {
    const exists = links.value.some(l =>
      (l.fromCardId === fromCardId && l.toCardId === toCardId) ||
      (l.fromCardId === toCardId && l.toCardId === fromCardId)
    )
    if (exists) return null

    const link: Link = {
      id: `l_${uid()}`,
      docId,
      fromCardId,
      toCardId
    }
    links.value.push(link)
    saveToLocal()
    return link
  }

  function deleteLink(linkId: string) {
    links.value = links.value.filter(l => l.id !== linkId)
    saveToLocal()
  }

  // === UI Actions ===
  function selectCard(cardId: string | null) {
    ui.value.selectedCardId = cardId
  }

  function startConnecting(fromCardId: string) {
    ui.value.isConnecting = true
    ui.value.connectingFromCardId = fromCardId
  }

  function finishConnecting(toCardId?: string) {
    if (toCardId && ui.value.connectingFromCardId && currentDocId.value) {
      if (toCardId !== ui.value.connectingFromCardId) {
        createLink(currentDocId.value, ui.value.connectingFromCardId, toCardId)
      }
    }
    ui.value.isConnecting = false
    ui.value.connectingFromCardId = null
  }

  // === Storage ===
  function saveToLocal() {
    const data: SaveData = {
      version: 3,
      categories: categories.value,
      projects: projects.value,
      docs: docs.value,
      docContents: docContents.value,
      highlights: highlights.value,
      cards: cards.value,
      links: links.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function loadFromLocal() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // 초기 데이터 생성
      const defaultCategory = createCategory('학습')
      createProject(defaultCategory.id, '일반')
      return
    }

    try {
      const data: SaveData = JSON.parse(stored)
      categories.value = data.categories || []
      projects.value = data.projects || []
      docs.value = data.docs || []
      docContents.value = data.docContents || {}
      highlights.value = data.highlights || []
      cards.value = data.cards || []
      links.value = data.links || []
      
      // 기존 프로젝트에 색상이 없으면 할당하고 저장
      let needsSave = false
      projects.value.forEach(project => {
        if (!project.color) {
          const usedColors = projects.value
            .filter(p => p.categoryId === project.categoryId && p.color)
            .map(p => p.color)
          const availableColors = PROJECT_COLORS.filter(c => !usedColors.includes(c))
          project.color = availableColors.length > 0 
            ? availableColors[Math.floor(Math.random() * availableColors.length)]
            : PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]
          needsSave = true
        }
      })
      
      // 마이그레이션된 데이터 저장
      if (needsSave) {
        saveToLocal()
      }
      
      if (categories.value.length === 0) {
        const defaultCategory = createCategory('학습')
        createProject(defaultCategory.id, '일반')
      }
    } catch {
      const defaultCategory = createCategory('학습')
      createProject(defaultCategory.id, '일반')
    }
  }

  // 스토어 생성 시 바로 데이터 로드
  loadFromLocal()

  return {
    // State
    categories,
    projects,
    docs,
    docContents,
    highlights,
    cards,
    links,
    currentDocId,
    ui,
    
    // Getters
    currentDoc,
    currentProject,
    currentCategory,
    getProjectsByCategory,
    getDocsByProject,
    getHighlightsByDoc,
    getCardsByDoc,
    getLinksByDoc,
    
    // Actions
    createCategory,
    updateCategory,
    deleteCategory,
    createProject,
    updateProject,
    deleteProject,
    createDoc,
    updateDoc,
    updateDocStatus,
    deleteDoc,
    setDocContent,
    openDoc,
    closeDoc,
    createHighlight,
    createCard,
    createMemoCard,
    updateCard,
    deleteCard,
    createLink,
    deleteLink,
    selectCard,
    startConnecting,
    finishConnecting,
    saveToLocal,
    loadFromLocal
  }
})
