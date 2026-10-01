import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref } from 'vue'


const _sfc_main = {
  __name: 'v-model-textarea',
  setup(__props) {

const notes = ref('')

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _withDirectives(_createElementVNode("textarea", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((notes).value = $event)),
      rows: "4"
    }, null, 512 /* NEED_PATCH */), [
      [_vModelText, notes.value]
    ]),
    _createElementVNode("p", null, _toDisplayString(notes.value.length) + " characters", 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}
}

}
export default _sfc_main
