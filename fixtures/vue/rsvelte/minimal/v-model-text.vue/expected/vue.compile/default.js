import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, createTextVNode as _createTextVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref } from 'vue'


const _sfc_main = {
  __name: 'v-model-text',
  setup(__props) {

const name = ref('')

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _createElementVNode("label", null, [
      _cache[1] || (_cache[1] = _createTextVNode(" Name ", -1 /* CACHED */)),
      _withDirectives(_createElementVNode("input", {
        "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((name).value = $event))
      }, null, 512 /* NEED_PATCH */), [
        [_vModelText, name.value]
      ])
    ]),
    _createElementVNode("p", null, "Hello, " + _toDisplayString(name.value) + "!", 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}
}

}
export default _sfc_main
