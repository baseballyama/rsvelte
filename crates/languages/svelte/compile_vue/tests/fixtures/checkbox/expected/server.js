import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['checked'];

const _hoisted_2 = { class: 'status' };

const _hoisted_3 = ['disabled'];

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'checkbox', setup(__props) {
	const $$bool = (v) => v === '' || Boolean(v);
	const agreed = $$ref(false);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('label', null, [_createElementVNode('input', { type: 'checkbox', class: 'agree', checked: $$bool(agreed.value) }, null, 8, _hoisted_1), _cache[0] || (_cache[0] = _createTextVNode(' I agree', -1))]), _cache[1] || (_cache[1] = _createTextVNode()), _createElementVNode('p', _hoisted_2, _toDisplayString(String((agreed.value ? 'agreed' : 'not yet') ?? '')), 1), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('button', { class: 'submit', disabled: !agreed.value }, 'continue', 8, _hoisted_3)], 64);
	};
} });

export default _sfc_main;
