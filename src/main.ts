import { createApp, ref, provide } from 'vue'
import './main.stylus'
import App from './App.vue'
import router from './router';
import './main.stylus'

window.addEventListener('moduleLoad', () => {
  const overflow = ref(false)
  createApp(App).use(router).provide('overflow', overflow).mount('#app')

  let body: HTMLElement = document.body as HTMLElement
  body.addEventListener('mousemove', (event: MouseEvent) => {
    if (body.offsetHeight - event.offsetY <= 20 + 28) { // 加上菜单的高度
      overflow.value = true
    } else if ((event.target as HTMLElement).id !== 'app' && ((event.target as HTMLElement).className === 'dock') || (event.target as HTMLElement).offsetParent?.className === 'dock' ) {
      overflow.value = true
    } else {
      overflow.value = false
    }
  })
})
