import { openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode } from "vue"

const _hoisted_1 = { key: 0 }
const _hoisted_2 = { key: 1 }
const _hoisted_3 = { key: 2 }
const _hoisted_4 = { key: 3 }


const _sfc_main = {
  __name: 'chains',
  props: { kind: String, items: Array },
  setup(__props) {



return (_ctx, _cache) => {
  return (_openBlock(), _createElementBlock("div", null, [
    _cache[0] || (_cache[0] = _createTextVNode(" head ", -1 /* CACHED */)),
    (__props.kind === 'a')
      ? (_openBlock(), _createElementBlock("span", _hoisted_1, "A"))
      : (__props.kind === 'b')
        ? (_openBlock(), _createElementBlock("span", _hoisted_2, "B " + _toDisplayString(__props.kind), 1 /* TEXT */))
        : (_openBlock(), _createElementBlock("span", _hoisted_3, "other")),
    _createTextVNode(" tail " + _toDisplayString(__props.kind) + " ", 1 /* TEXT */),
    (__props.items.length)
      ? (_openBlock(), _createElementBlock("b", _hoisted_4, _toDisplayString(__props.items.length), 1 /* TEXT */))
      : _createCommentVNode("v-if", true)
  ]))
}
}

}
export default _sfc_main
