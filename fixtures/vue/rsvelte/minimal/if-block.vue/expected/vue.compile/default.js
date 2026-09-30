import { openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode } from "vue"

const _hoisted_1 = { key: 0 }
const _hoisted_2 = { key: 1 }


const _sfc_main = {
  __name: 'if-block',
  props: { ok: Boolean },
  setup(__props) {



return (_ctx, _cache) => {
  return (__props.ok)
    ? (_openBlock(), _createElementBlock("p", _hoisted_1, "yes"))
    : (_openBlock(), _createElementBlock("p", _hoisted_2, "no"))
}
}

}
export default _sfc_main
