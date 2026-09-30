import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createElementVNode as _createElementVNode } from "vue"

import { ref } from 'vue'

const unused = 1

const _sfc_main = {
  __name: 'lint-cases',
  setup(__props) {

const label = ref('a')

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("ul", null, [
    (_openBlock(), _createElementBlock(_Fragment, null, _renderList([1, 2], (item, i) => {
      return _createElementVNode("li", { key: item }, _toDisplayString(label.value), 1 /* TEXT */)
    }), 64 /* STABLE_FRAGMENT */))
  ]))
}
}

}
export default _sfc_main
