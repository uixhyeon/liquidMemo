import { createClient } from '@supabase/supabase-js'

// ⚠️ 나중에 Supabase 프로젝트 만든 후 여기에 입력!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// OTP 전송 (이메일로 인증번호 보내기)
// 회원가입용: shouldCreateUser: true
// 로그인용: shouldCreateUser: false
export async function sendOTP(email: string, isSignup: boolean = false) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: isSignup, // 회원가입이면 true, 로그인이면 false
    }
  })
  
  if (error) throw error
  return true
}

// OTP 인증 (인증번호로 로그인)
export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  
  if (error) throw error
  return data.user
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 현재 세션 가져오기
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// 현재 사용자 가져오기
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// === 데이터베이스 함수들 ===

// 카테고리
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createCategory(name: string, color: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: user.id, name, color })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: { name?: string; color?: string }) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 프로젝트
export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createProject(categoryId: string, name: string, color: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, category_id: categoryId, name, color })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: { name?: string; color?: string; category_id?: string }) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 문서
export async function fetchDocs() {
  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createDoc(projectId: string, title: string, status: string = 'draft') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('docs')
    .insert({ 
      user_id: user.id, 
      project_id: projectId, 
      title, 
      status,
      content: {}
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDoc(id: string, updates: { title?: string; status?: string; content?: any }) {
  const updateData: any = { ...updates, updated_at: new Date().toISOString() }
  if (updates.content) {
    updateData.content = updates.content
  }
  
  const { data, error } = await supabase
    .from('docs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteDoc(id: string) {
  const { error } = await supabase
    .from('docs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 하이라이트
export async function fetchHighlights(docId?: string) {
  let query = supabase
    .from('highlights')
    .select('*')
  
  if (docId) {
    query = query.eq('doc_id', docId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function createHighlight(docId: string, fromPos: number, toPos: number, color: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('highlights')
    .insert({ 
      user_id: user.id,
      doc_id: docId, 
      from_pos: fromPos, 
      to_pos: toPos, 
      color,
      linked_card_ids: []
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateHighlight(id: string, updates: { color?: string; linked_card_ids?: string[] }) {
  const { data, error } = await supabase
    .from('highlights')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteHighlight(id: string) {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 카드
export async function fetchCards(docId?: string) {
  let query = supabase
    .from('cards')
    .select('*')
  
  if (docId) {
    query = query.eq('doc_id', docId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function createCard(
  docId: string, 
  highlightId: string | null, 
  quote: string, 
  note: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('cards')
    .insert({ 
      user_id: user.id,
      doc_id: docId, 
      highlight_id: highlightId,
      quote, 
      note,
      x_pos: x,
      y_pos: y,
      width,
      height
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCard(id: string, updates: { 
  quote?: string; 
  note?: string; 
  x_pos?: number; 
  y_pos?: number; 
  width?: number; 
  height?: number 
}) {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCard(id: string) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 링크
export async function fetchLinks(docId?: string) {
  let query = supabase
    .from('links')
    .select('*')
  
  if (docId) {
    query = query.eq('doc_id', docId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function createLink(docId: string, fromCardId: string, toCardId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('links')
    .insert({ 
      user_id: user.id,
      doc_id: docId, 
      from_card_id: fromCardId, 
      to_card_id: toCardId 
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteLink(id: string) {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

