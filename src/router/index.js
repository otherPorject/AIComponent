import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/smartCode'),
  routes: [
    {
      path: '/',
      name: 'AIMessage',
      component: () => import('../views/TsAiComponent.vue')
    },
    {
      path: '/dialog',
      name: 'dialog',
      component: () => import('../views/AIDialog.vue')
    }
  ]
})

export default router
