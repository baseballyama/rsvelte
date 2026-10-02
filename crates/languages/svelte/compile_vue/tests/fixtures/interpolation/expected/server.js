import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'interpolation', setup(__props) {
	const object = { a: 1, b: [true, null] };
	const list = ['x', 'y'];
	const nothing = undefined;
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('pre', null, _toDisplayString(String(JSON.stringify(object, null, 2) ?? '')), 1), _cache[0] || (_cache[0] = _createTextVNode()), _createElementVNode('p', null, _toDisplayString(String(JSON.stringify(list, null, 2) ?? '')), 1), _cache[1] || (_cache[1] = _createTextVNode()), _cache[2] || (_cache[2] = _createElementVNode('p', null, '[' + _toDisplayString('') + '] [' + _toDisplayString('') + ']', -1))], 64);
	};
} });

export default _sfc_main;
