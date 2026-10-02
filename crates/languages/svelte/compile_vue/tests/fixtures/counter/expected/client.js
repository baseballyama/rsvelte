import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'counter' };

const _hoisted_2 = { class: 'count' };

import { ref as $$ref, computed as $$computed } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'counter', setup(__props) {
	const count = $$ref(0);
	const doubled = $$computed(() => count.value * 2);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('div', _hoisted_1, [_createElementVNode('button', { class: 'dec', onClick: _cache[0] || (_cache[0] = () => count.value--) }, '-'), _createElementVNode('span', _hoisted_2, _toDisplayString(`${count.value ?? ''}`), 1), _createElementVNode('button', { class: 'inc', onClick: _cache[1] || (_cache[1] = () => count.value++) }, '+')]), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('p', null, 'doubled: ' + _toDisplayString(`${doubled.value}`), 1)], 64);
	};
} });

export default _sfc_main;
