import { unref as _unref, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['title'];

import { msg } from './data.js';

const _sfc_main = { __name: 'unref', setup(__props) {
	let n = 1;
	const obj = { a: 1 };
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('p', { title: _unref(msg), onInput: _cache[0] || (_cache[0] = ($event) => msg.value = $event) }, _toDisplayString(_unref(msg)) + ' ' + _toDisplayString(_unref(n)) + ' ' + _toDisplayString(obj.a), 41, _hoisted_1);
	};
} };

export default _sfc_main;
