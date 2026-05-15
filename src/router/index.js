import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { 
    path: '/query', 
    name: 'Query', 
    component: () => import('../views/Query.vue')
  },
  { 
    path: '/gene/:symbol', 
    name: 'GeneDetail', 
    component: () => import('../views/GeneDetail.vue'), // 路由懒加载
    props: true 
  },
  { 
    path: '/trait/smr', 
    name: 'TraitSMR', 
    component: () => import('../views/TraitSMR.vue'),
    props: true
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('../views/Download.vue')
  },
  {
    path: '/documentation',
    name: 'Documentation',
    component: () => import('../views/Documentation.vue')
  },
  { 
    path: '/tissue/:tissue', 
    name: 'TissueDetail', 
    component: () => import('../views/TissueDetail.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
