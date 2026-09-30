import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref, computed } from 'vue'


const _sfc_main = {
  __name: 'derived',
  setup(__props) {

const count = ref(1)
const double = computed(() => count.value * 2)

function increment() {
  count.value += 1
}

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("button", {
    type: "button",
    onClick: increment
  }, _toDisplayString(count.value) + " * 2 = " + _toDisplayString(double.value), 1 /* TEXT */))
}
}

}
export default _sfc_main
