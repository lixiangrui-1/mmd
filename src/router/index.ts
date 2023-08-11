import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'
import player from '../pages/MMDplayer/index';
import video from '../pages/video/index.vue'
// import a from '../pages/a/index'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'player',
    component: player
  },
  {
    path: '/video',
    name: 'video',
    component: video
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
