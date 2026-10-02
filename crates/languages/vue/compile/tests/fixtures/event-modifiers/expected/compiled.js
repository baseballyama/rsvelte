import { withModifiers as _withModifiers, createElementVNode as _createElementVNode, withKeys as _withKeys, renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString } from 'vue';

const _hoisted_1 = ['onKeyup'];

const _hoisted_2 = ['onClick'];

import { ref } from 'vue';

const _sfc_main = { __name: 'event-modifiers', setup(__props) {
	const count = ref(0);
	const rows = ref([{ id: 1 }, { id: 2 }]);
	function inc() {
		count.value++;
	}
	function pick(row) {
		console.log(row);
	}
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('form', { onSubmit: _withModifiers(inc, ['prevent']) }, [_createElementVNode('button', { onClick: _withModifiers(inc, ['stop']) }, 'stop'), _createElementVNode('button', { onClick: _cache[0] || (_cache[0] = _withModifiers(($event) => count.value++, ['stop', 'prevent'])) }, 'both'), _createElementVNode('div', { onClick: _withModifiers(inc, ['self']) }, 'self'), _createElementVNode('button', { onClick: _withModifiers(inc, ['ctrl', 'exact']) }, 'ctrl'), _createElementVNode('button', { onContextmenu: _withModifiers(inc, ['right']) }, 'right', 32), _createElementVNode('button', { onMouseup: _withModifiers(inc, ['middle']) }, 'middle', 32), _createElementVNode('button', { onClickOnce: inc }, 'once', 32), _createElementVNode('div', { onScrollPassiveCapture: inc }, 'options', 32), _createElementVNode('input', { onKeyup: _withKeys(inc, ['enter']), onKeydown: _cache[1] || (_cache[1] = _withKeys(_withModifiers(() => inc(), ['stop']), ['esc'])) }, null, 32), _createElementVNode('input', { onKeydown: _withKeys(inc, ['left']), onKeyup: _withKeys(_withModifiers(inc, ['ctrl']), ['page-down']) }, null, 40, _hoisted_1), _createElementVNode('ul', null, [(_openBlock(true), _createElementBlock(_Fragment, null, _renderList(rows.value, (row) => {
			return _openBlock(), _createElementBlock('li', { key: row.id, onClick: _withModifiers(($event) => pick(row), ['prevent']) }, _toDisplayString(row.id), 9, _hoisted_2);
		}), 128))])], 32), _createElementVNode('p', null, _toDisplayString(count.value), 1)], 64);
	};
} };

export default _sfc_main;
