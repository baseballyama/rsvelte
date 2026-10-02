import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['value'];

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'number-input', setup(__props) {
	const $$attr = (v) => v == null ? null : String(v);
	const n = $$ref(1);
	const input = $$ref();
	const looseToNumber = (text) => {
		const number = parseFloat(text);
		return isNaN(number) ? text : number;
	};
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('input', { type: 'number', value: $$attr(input.value && looseToNumber(input.value.value) === n.value ? input.value.value : n.value) }, null, 8, _hoisted_1), _cache[0] || (_cache[0] = _createTextVNode()), _createElementVNode('p', null, _toDisplayString(String(typeof n.value ?? '')) + ': ' + _toDisplayString(String(n.value ?? '')) + ' + 1 = ' + _toDisplayString(String(n.value + 1 ?? '')), 1)], 64);
	};
} });

export default _sfc_main;
