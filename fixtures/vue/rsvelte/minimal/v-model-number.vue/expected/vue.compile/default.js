import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref } from 'vue'


const _sfc_main = {
  __name: 'v-model-number',
  setup(__props) {

const count = ref(0)
const age = ref(18)

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("div", null, [
    _withDirectives(_createElementVNode("input", {
      type: "number",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((count).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [_vModelText, count.value]
    ]),
    _withDirectives(_createElementVNode("input", {
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((age).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [
        _vModelText,
        age.value,
        void 0,
        { number: true }
      ]
    ]),
    _createElementVNode("p", null, _toDisplayString(count.value + age.value), 1 /* TEXT */)
  ]))
}
}

}
export default _sfc_main
