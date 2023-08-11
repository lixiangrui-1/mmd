<template>
  <div class="top">
    <div class="top-lf">
      <div class="top-lf-item" v-for="item of topBtnList" @click="topBtnclick">
        {{item.name}}
        <div class="menu">
          <div class="menu-item" v-for="attr of item.children" @click.stop="() => attr.callback && attr.callback()">{{attr.name}}</div>
        </div>
      </div>
    </div>
    <div>
      {{ time }}
    </div>
  </div>
  <div class="center">
    <Main />
  </div>
  <div class="dock" :style="overflow ? 'bottom: 10px' : 'bottom: -50px'">
    <div class="dockItem" @mouseover="dockItem" @mouseout="dockItemout" v-for="item of 6"></div>
  </div>
</template>

<script lang="ts">
import img from './assets/img/1.png'
import Main from './components/main'
import { defineComponent, inject, Ref, onMounted, ref, provide } from 'vue'
import { dateFormat, getDay } from './hooks/useTime'
export default defineComponent({
  components: {
    Main
  },
  setup () {
    const overflow = inject<Ref<boolean>>('overflow')
    const setBackImg = () => {
     let app: HTMLElement = document.querySelector('#app') as HTMLElement
     app.style.backgroundImage = `url(${img})`
     app.style.backgroundSize = 'cover'
    }

    const dockItem = (event: MouseEvent) => {
      let thisElement: HTMLElement = event.target as HTMLElement
      let leftOther1 = thisElement.previousElementSibling
      let leftOther2 = leftOther1?.previousElementSibling
      let rightOther1 = thisElement.nextElementSibling
      let rightOther2 = rightOther1?.nextElementSibling
      thisElement.className = 'dockItem1'
      leftOther1 ? leftOther1.className = 'dockItem1-l1' : ''
      leftOther2 ? leftOther2.className = 'dockItem1-l2' : ''
      rightOther1 ? rightOther1.className = 'dockItem1-r1' : ''
      rightOther2? rightOther2.className = 'dockItem1-r2' : ''
    }
    const dockItemout = () => {
      Array.from(document.querySelector('.dock')!.children).forEach(element => {
        element.className = 'dockItem'
      });
    }

    // top
    const time = ref(dateFormat('MM月DD日 hh:mm') + ' ' + getDay())
    const topBtnList = ref([
      { name: '首页', children: [] },
      { name: '文件', children: [{ name: '查看', callback: () => null }] },
    ])
    const topBtnclick = (event: Event) => {
      let children: HTMLElement = event.target as HTMLElement
      let childrenItem = (children.firstElementChild as HTMLElement)
      childrenItem.style.display = childrenItem.style.display === 'block' ? 'none' : 'block'
    }
    document.body.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).className !== 'top-lf-item') {
        document.querySelectorAll('.menu').forEach((item) => {
          (item as HTMLElement).style.display = 'none'
        })
      }
    }, true) // 事件捕获
    provide('topBtn', topBtnList)

    onMounted(() => {
    
      setInterval(() => {
        time.value = dateFormat('MM月DD日 hh:mm') + ' ' + getDay()
      }, 6000)

      // setBackImg()
    })
    return {
      overflow,
      dockItem,
      dockItemout,
      time,
      topBtnList,
      topBtnclick
    }
  }
})
</script>

<style lang="stylus" scoped>
.dockItem {
  height: 46px
  width: 46px
  background: #0099ee
}
.dockItem1 {
  height: 92px
  width: 92px
  background: #0099ee
  transform: translateY(-46px)
}
.dockItem1-l1 {
  height: 68px
  width: 68px
  background: #0099ee
  transform: translateY(-22px)
}
.dockItem1-l2 {
  height: 54px
  width: 54px
  background: #0099ee
  transform: translateY(-8px)
}
.dockItem1-r1 {
  height: 68px
  width: 68px
  background: #0099ee
  transform: translateY(-22px)
}
.dockItem1-r2 {
  height: 54px
  width: 54px
  background: #0099ee
  transform: translateY(-8px)
}

.top
  display: flex
  height: 28px
  width 100%
  padding: 0 20px
  box-sizing: border-box
  background-color #fff
  justify-content: space-between
  align-items: center
  font-size: 14px
  font-family: 'PingFangSC-Regular, sans-serif'
  filter: opacity(0.7)
  font-weight: 500
  user-select: none;
  .top-lf
    display: flex
    align-items: center
    .top-lf-item
      margin-right 10px
      position relative
      padding: 0 10px

.menu
  display: none
  position: absolute
  top: 100%
  left: 0
  min-width: 140px
  transition: 0.1s
  background #fff
  border-radius: 5px
  padding: 5px
  .menu-item
    height: 22px
    width 100%
    line-height: 22px
    text-indent: 0.5em
  .menu-item:hover
    background: #0099ff
    color: #fff

.center {
  height: calc(100% - 28px)
  color: #fff
}
</style>