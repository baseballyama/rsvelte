import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode } from 'vue';

const _hoisted_1 = ['onClick'];

const _hoisted_2 = { key: 0 };

import { ref } from 'vue';

const _sfc_main = { __name: 'loop-handlers', setup(__props) {
	const rows = ref([{ id: 1, name: 'a' }]);
	function pick(row) {
		console.log(row);
	}
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('ul', null, [(_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rows.value, (row) => {
			return _openBlock(), _createElementBlock('li', { key: row.id, onClick: ($event) => pick(row) }, [row.name ? (_openBlock(), _createElementBlock('span', _hoisted_2, _toDisplayString(row.name), 1)) : _createCommentVNode('v-if', true)], 8, _hoisted_1);
		}), 128))]), _createElementVNode('button', { onClick: _cache[0] || (_cache[0] = (e) => pick(e)) }, 'x')], 64);
	};
} };

export default _sfc_main;
