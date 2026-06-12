import { createRouter, createWebHistory } from 'vue-router'
import ConstanciaView from '../views/ConstanciaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      
      path: '/',
      name: 'home',
      component: ConstanciaView
    },
    {
      path: '/constancia/:cui',
      name: 'constancia',
      component: ConstanciaView
    }
  ]
})

export default router