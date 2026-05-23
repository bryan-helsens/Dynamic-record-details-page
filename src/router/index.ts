import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/classes/:classId/records',
      name: 'class-records',
      component: () => import('@/pages/HomePage.vue'), // placeholder — implement listing
    },
    {
      path: '/records/:recordId',
      name: 'record-details',
      component: () => import('@/pages/RecordDetailsPage.vue'),
    },
    {
      path: '/classes/:classId/views/:viewId',
      name: 'view-builder',
      component: () => import('@/pages/ViewBuilderPage.vue'),
    },
  ],
})

export default router
