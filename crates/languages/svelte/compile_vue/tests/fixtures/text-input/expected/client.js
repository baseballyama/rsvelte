import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'greeting' };

const _hoisted_2 = { class: 'shout' };

import { ref as $$ref, computed as $$computed } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'text-input', setup(__props) {
	const name = $$ref('world');
	const shout = $$computed(() => name.value.toUpperCase());
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('label', null, [_cache[1] || (_cache[1] = _createTextVNode('Name ', -1)), _createElementVNode('input', { class: 'name', onInput: _cache[0] || (_cache[0] = ($$e) => name.value = $$e.currentTarget.value), ref: ($$el) => {
			if ($$el !== null) {
				name.value !== $$el.value && ($$el.value = name.value ?? '');
			}
		} }, null, 544)]), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('p', _hoisted_1, 'Hello, ' + _toDisplayString(`${name.value ?? ''}`) + '!', 1), _cache[3] || (_cache[3] = _createTextVNode()), _createElementVNode('p', _hoisted_2, _toDisplayString(`${shout.value ?? ''}`) + ' (' + _toDisplayString(`${name.value.length ?? ''}`) + ')', 1)], 64);
	};
} });

export default _sfc_main;
