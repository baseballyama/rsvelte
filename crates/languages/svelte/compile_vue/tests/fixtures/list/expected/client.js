import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, createCommentVNode as _createCommentVNode, createTextVNode as _createTextVNode } from 'vue';

const _hoisted_1 = { key: 0 };

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'list', setup(__props) {
	const $$each = (c) => Array.isArray(c) ? c : c == null ? [] : Array.from(c);
	const items = $$ref([{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }]);
	let next = 3;
	function add() {
		items.value.push({ id: next, name: `item ${next}` });
		next++;
	}
	function removeFirst() {
		items.value.shift();
	}
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('ul', null, [(_openBlock(true), _createElementBlock(_Fragment, null, _renderList($$each(items.value), (item, i) => {
			return _openBlock(), _createElementBlock('li', { key: item.id }, _toDisplayString(`${i + 1}`) + '. ' + _toDisplayString(`${item.name ?? ''}`), 1);
		}), 128))]), _cache[0] || (_cache[0] = _createTextVNode()), items.value.length === 0 ? (_openBlock(), _createElementBlock('p', _hoisted_1, 'empty')) : _createCommentVNode('v-if', true), _cache[1] || (_cache[1] = _createTextVNode()), _createElementVNode('button', { class: 'add', onClick: add }, 'add'), _createElementVNode('button', { class: 'remove', onClick: removeFirst }, 'remove first')], 64);
	};
} });

export default _sfc_main;
