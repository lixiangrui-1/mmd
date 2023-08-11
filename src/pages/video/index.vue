<script>
import { h } from 'vue'

export default {

    render () {

      let value = '123aa878bbcc99'

      let filterValues = ['aa', 'bb', 'cc']

      let renderValue = value
      filterValues.forEach(item => {
        renderValue = renderValue.replace(item, `<span style="color: red">${item}</span>`)
      })
      
      let dom = h ('div')
      console.log(dom);
      dom.el.innerHTML = renderValue
      return dom
    }

}
</script>
