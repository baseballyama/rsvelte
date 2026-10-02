import { vModelText as _vModelText, createElementVNode as _createElementVNode, withDirectives as _withDirectives, vModelCheckbox as _vModelCheckbox, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { reactive } from 'vue';

const _sfc_main = { __name: 'v-model-reactive', setup(__props) {
	const form = reactive({ email: '', subscribe: true });
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('div', null, [_withDirectives(_createElementVNode('input', { type: 'email', 'onUpdate:modelValue': _cache[0] || (_cache[0] = ($event) => form.email = $event) }, null, 512), [[_vModelText, form.email, void 0, { trim: true }]]), _withDirectives(_createElementVNode('input', { type: 'checkbox', 'onUpdate:modelValue': _cache[1] || (_cache[1] = ($event) => form.subscribe = $event) }, null, 512), [[_vModelCheckbox, form.subscribe]]), _createElementVNode('p', null, _toDisplayString(form.email), 1)]);
	};
} };

export default _sfc_main;
