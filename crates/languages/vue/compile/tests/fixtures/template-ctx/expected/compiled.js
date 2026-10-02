const _sfc_main = {};

import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['id'];

function _sfc_render(_ctx, _cache) {
	return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('p', { id: _ctx.id, onMouseover: _cache[0] || (_cache[0] = ($event) => _ctx.hover(_ctx.id)) }, _toDisplayString(Math.max(_ctx.a, 1)) + ' ' + _toDisplayString(_ctx.label), 41, _hoisted_1), _cache[1] || (_cache[1] = _createElementVNode('p', null, _toDisplayString(undefined), -1))], 64);
}

import _export_sfc from 'plugin-vue:export-helper';

export default /* @__PURE__ */ _export_sfc(_sfc_main, [['render', _sfc_render]]);
