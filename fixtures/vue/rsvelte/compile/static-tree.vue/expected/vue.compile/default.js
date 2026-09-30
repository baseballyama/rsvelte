const _sfc_main = {}
import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

function _sfc_render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("section", null, [...(_cache[0] || (_cache[0] = [
    _createElementVNode("div", { class: "a" }, [
      _createElementVNode("em", null, "one"),
      _createTextVNode(" two")
    ], -1 /* CACHED */),
    _createElementVNode("ul", null, [
      _createElementVNode("li", null, "x"),
      _createElementVNode("li", null, "y & z")
    ], -1 /* CACHED */)
  ]))]))
}
import _export_sfc from 'plugin-vue:export-helper'
export default /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render]])
