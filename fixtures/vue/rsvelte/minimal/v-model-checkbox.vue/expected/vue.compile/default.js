import { vModelCheckbox as _vModelCheckbox, createElementVNode as _createElementVNode, withDirectives as _withDirectives, vModelRadio as _vModelRadio, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = ["disabled"]

import { ref } from 'vue'


const _sfc_main = {
  __name: 'v-model-checkbox',
  setup(__props) {

const agreed = ref(false)
const picked = ref('a')

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("form", null, [
    _withDirectives(_createElementVNode("input", {
      type: "checkbox",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((agreed).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [_vModelCheckbox, agreed.value]
    ]),
    _withDirectives(_createElementVNode("input", {
      type: "radio",
      value: "a",
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((picked).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [_vModelRadio, picked.value]
    ]),
    _withDirectives(_createElementVNode("input", {
      type: "radio",
      value: "b",
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((picked).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [_vModelRadio, picked.value]
    ]),
    _createElementVNode("button", {
      type: "submit",
      disabled: !agreed.value
    }, "Send", 8 /* PROPS */, _hoisted_1)
  ]))
}
}

}
export default _sfc_main
