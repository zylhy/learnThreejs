import { createRouter, createWebHistory } from 'vue-router'

let routes = [
    { path: '/', name: 'home', component: () => import('../views/index.vue') }]

const router = createRouter({
    routes, history: createWebHistory()
})

export default router;  