import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/projects',
    name: 'ProjectList',
    component: () => import('../views/ProjectList.vue'),
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue'),
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  // Admin routes
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('../views/admin/AdminProjects.vue'),
      },
      {
        path: 'audits',
        name: 'AdminAudits',
        component: () => import('../views/admin/AdminAudits.vue'),
      },
      {
        path: 'donations',
        name: 'AdminDonations',
        component: () => import('../views/admin/AdminDonations.vue'),
      },
      {
        path: 'funds',
        name: 'AdminFunds',
        component: () => import('../views/admin/AdminFunds.vue'),
      },
      {
        path: 'feedbacks',
        name: 'AdminFeedbacks',
        component: () => import('../views/admin/AdminFeedbacks.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
