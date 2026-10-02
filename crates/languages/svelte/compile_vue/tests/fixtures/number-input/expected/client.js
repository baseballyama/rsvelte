import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'number-input', setup(__props) {
	const $$value = (el, v) => {
		const last = el.$$value;
		el.$$value = v ?? undefined;
		if (last === el.$$value || el.value === v) return;
		el.value = v ?? '';
	};
	const n = $$ref(1);
	const input = $$ref();
	const looseToNumber = (text) => {
		const number = parseFloat(text);
		return isNaN(number) ? text : number;
	};
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('input', { type: 'number', onInput: _cache[0] || (_cache[0] = (e) => n.value = looseToNumber(e.currentTarget.value)), ref: ($$el) => {
			if ($$el !== null) {
				$$value($$el, input.value && looseToNumber(input.value.value) === n.value ? input.value.value : n.value);
			}
			input.value = $$el;
		} }, null, 544), _cache[1] || (_cache[1] = _createTextVNode()), _createElementVNode('p', null, _toDisplayString(`${typeof n.value}`) + ': ' + _toDisplayString(`${n.value ?? ''}`) + ' + 1 = ' + _toDisplayString(`${n.value + 1}`), 1)], 64);
	};
} });

export default _sfc_main;
