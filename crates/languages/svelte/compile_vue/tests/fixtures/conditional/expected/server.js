import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, createTextVNode as _createTextVNode, Fragment as _Fragment } from 'vue';

const _hoisted_1 = { class: 'toggle' };

const _hoisted_2 = { key: 0, class: 'details' };

const _hoisted_3 = { key: 1, class: 'hint' };

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'conditional', setup(__props) {
	const open = $$ref(false);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('button', _hoisted_1, _toDisplayString(String((open.value ? 'Hide' : 'Show') ?? '')), 1), _cache[0] || (_cache[0] = _createTextVNode()), open.value ? (_openBlock(), _createElementBlock('p', _hoisted_2, 'Details are visible.')) : (_openBlock(), _createElementBlock('p', _hoisted_3, 'Nothing to see.'))], 64);
	};
} });

export default _sfc_main;
