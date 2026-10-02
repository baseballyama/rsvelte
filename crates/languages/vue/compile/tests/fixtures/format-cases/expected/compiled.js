import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode } from 'vue';

const _hoisted_1 = ['data-count'];

const _hoisted_2 = { key: 0 };

const _hoisted_3 = { key: 1 };

import { ref, computed } from 'vue';

const _sfc_main = { __name: 'format-cases', setup(__props) {
	const items = ref([1, 2, 3]);
	const total = computed(() => items.value.length * 2 + 1);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('section', { class: 'list', 'data-count': total.value }, [_cache[0] || (_cache[0] = _createElementVNode('h2', null, 'List', -1)), items.value.length > 0 ? (_openBlock(), _createElementBlock('p', _hoisted_2, _toDisplayString(total.value) + ' items, the first one is ' + _toDisplayString(items.value[0]) + ' and there is a long tail of text here', 1)) : (_openBlock(), _createElementBlock('p', _hoisted_3, 'none'))], 8, _hoisted_1);
	};
} };

export default _sfc_main;
