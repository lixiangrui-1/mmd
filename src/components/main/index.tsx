import { defineComponent, Transition } from "vue";

export default defineComponent({
  setup () {
    return () => (
      <Transition>
        <router-view></router-view>
      </Transition>
    )
  }
})