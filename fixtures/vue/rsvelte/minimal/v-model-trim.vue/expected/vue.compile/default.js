import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

import { ref } from 'vue'


const _sfc_main = {
  __name: 'v-model-trim',
  setup(__props) {

const query = ref('')

return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _withDirectives(_createElementVNode("input", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((query).value = $event)),
      placeholder: "Search"
    }, null, 512 /* NEED_PATCH */), [
      [
        _vModelText,
        query.value,
        void 0,
        { trim: true }
      ]
    ]),
    _withDirectives(_createElementVNode("input", {
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((query).value = $event))
    }, null, 512 /* NEED_PATCH */), [
      [
        _vModelText,
        query.value,
        void 0,
        {
          lazy: true,
          trim: true
        }
      ]
    ])
  ], 64 /* STABLE_FRAGMENT */))
}
}

}
export default _sfc_main
