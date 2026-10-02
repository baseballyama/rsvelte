import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'size' };

const _hoisted_2 = ['selected'];

const _hoisted_3 = ['selected'];

const _hoisted_4 = ['selected'];

const _hoisted_5 = ['value'];

const _hoisted_6 = { class: 'summary' };

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'form-controls', setup(__props) {
	const $$attr = (v) => v == null ? null : String(v);
	const size = $$ref('m');
	const note = $$ref('none');
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('select', _hoisted_1, [_createElementVNode('option', { value: 's', selected: size.value === 's' }, 'small', 8, _hoisted_2), _createElementVNode('option', { value: 'm', selected: size.value === 'm' }, 'medium', 8, _hoisted_3), _createElementVNode('option', { value: 'l', selected: size.value === 'l' }, 'large', 8, _hoisted_4)]), _createElementVNode('input', { class: 'note', value: $$attr(note.value) }, null, 8, _hoisted_5), _cache[0] || (_cache[0] = _createTextVNode()), _createElementVNode('p', _hoisted_6, 'size ' + _toDisplayString(String(size.value ?? '')) + ', note ' + _toDisplayString(String(note.value ?? '')), 1)], 64);
	};
} });

export default _sfc_main;
