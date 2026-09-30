import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref } from 'vue'


const _sfc_main = {
  __name: 'counter',
  setup(__props) {

const count = ref(0)

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("button", {
    type: "button",
    onClick: _cache[0] || (_cache[0] = $event => (count.value++))
  }, "clicks: " + _toDisplayString(count.value), 1 /* TEXT */))
}
}

}
export default _sfc_main
