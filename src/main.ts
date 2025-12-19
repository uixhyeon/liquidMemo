import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/globals.scss'

import Landing from './views/Landing.vue'
import Signup from './views/Signup.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Writing from './views/Writing.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      name: 'landing', 
      component: Landing,
      meta: { requiresGuest: true } // 비로그인 사용자만
    },
    { 
      path: '/signup', 
      name: 'signup', 
      component: Signup,
      meta: { requiresGuest: true }
    },
    { 
      path: '/login', 
      name: 'login', 
      component: Login,
      meta: { requiresGuest: true }
    },
    { 
      path: '/dashboard', 
      name: 'dashboard', 
      component: Dashboard,
      meta: { requiresAuth: true } // 로그인 필요
    },
    { 
      path: '/write/:id', 
      name: 'writing', 
      component: Writing,
      meta: { requiresAuth: true }
    }
  ]
})

// 라우터 가드 - App.vue에서 설정
export { router }

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
