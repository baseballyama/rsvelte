import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['value'];

const _hoisted_2 = { class: 'greeting' };

const _hoisted_3 = { class: 'shout' };

import { ref as $$ref, computed as $$computed } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'text-input', setup(__props) {
	const $$attr = (v) => v == null ? null : String(v);
	const name = $$ref('world');
	const shout = $$computed(() => name.value.toUpperCase());
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('label', null, [_cache[0] || (_cache[0] = _createTextVNode('Name ', -1)), _createElementVNode('input', { class: 'name', value: $$attr(name.value) }, null, 8, _hoisted_1)]), _cache[1] || (_cache[1] = _createTextVNode()), _createElementVNode('p', _hoisted_2, 'Hello, ' + _toDisplayString(String(name.value ?? '')) + '!', 1), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('p', _hoisted_3, _toDisplayString(String(shout.value ?? '')) + ' (' + _toDisplayString(String(name.value.length ?? '')) + ')', 1)], 64);
	};
} });

export default _sfc_main;
