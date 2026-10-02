import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = ['href', 'title'];

const _sfc_main = { __name: 'attributes', props: { href: String, label: String }, setup(__props) {
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('a', { href: __props.href, class: 'link', title: 'go to ' + __props.label }, _toDisplayString(__props.label), 9, _hoisted_1);
	};
} };

export default _sfc_main;
