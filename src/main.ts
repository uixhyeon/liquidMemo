import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/globals.scss'

import Dashboard from './views/Dashboard.vue'
import Writing from './views/Writing.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/write/:id', name: 'writing', component: Writing }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
