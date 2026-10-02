import { createElementVNode as _createElementVNode, vModelSelect as _vModelSelect, withDirectives as _withDirectives, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { ref } from 'vue';

const _sfc_main = { __name: 'v-model-select', setup(__props) {
	const color = ref('red');
	return (_ctx, _cache) => {
		return _withDirectives((_openBlock(), _createElementBlock('select', { 'onUpdate:modelValue': _cache[0] || (_cache[0] = ($event) => color.value = $event) }, [..._cache[1] || (_cache[1] = [_createElementVNode('option', { value: 'red' }, 'Red', -1), _createElementVNode('option', { value: 'green' }, 'Green', -1)])], 512)), [[_vModelSelect, color.value]]);
	};
} };

export default _sfc_main;
