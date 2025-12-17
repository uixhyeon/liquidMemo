// 대분류 (카테고리)
export interface Category {
  id: string
  name: string
  color: string
  createdAt: number
}

// 중분류 (프로젝트)
export interface Project {
  id: string
  categoryId: string
  name: string
  color: string
  createdAt: number
}

// 문서 상태
export type DocStatus = 'draft' | 'progress' | 'done'

// 소분류 (문서)
export interface Doc {
  id: string
  projectId: string
  title: string
  status: DocStatus
  createdAt: number
  updatedAt: number
}

// 하이라이트
export interface Highlight {
  id: string
  docId: string
  from: number
  to: number
  color: string
  linkedCardIds: string[]
}

// 메모 카드
export interface Card {
  id: string
  docId: string
  highlightId: string
  quote: string
  note: string
  x: number
  y: number
  width: number
  height: number
  createdAt: number
}

// 카드 연결
export interface Link {
  id: string
  docId: string
  fromCardId: string
  toCardId: string
}

// UI 상태
export interface UIState {
  selectedCardId: string | null
  isConnecting: boolean
  connectingFromCardId: string | null
}

// 저장 데이터
export interface SaveData {
  version: number
  categories: Category[]
  projects: Project[]
  docs: Doc[]
  docContents: Record<string, any>
  highlights: Highlight[]
  cards: Card[]
  links: Link[]
}

// 상태 라벨
export const STATUS_LABELS: Record<DocStatus, string> = {
  draft: '초안',
  progress: '진행중',
  done: '완료'
}

export const STATUS_COLORS: Record<DocStatus, string> = {
  draft: '#9ca3af',
  progress: '#f59e0b',
  done: '#10b981'
}

// 기본 카테고리 색상 (빈티지 톤 10색)
export const CATEGORY_COLORS = [
  '#1d3557', '#c1513b', '#e07b39', '#e9b44c', '#d4a574',
  '#7d8471', '#3d4a37', '#b5835a', '#8b7355', '#5c4033'
]

// 프로젝트 색상 (빈티지 톤 10색)
export const PROJECT_COLORS = [
  '#1d3557', '#c1513b', '#e07b39', '#e9b44c', '#d4a574',
  '#7d8471', '#3d4a37', '#b5835a', '#8b7355', '#5c4033'
]
