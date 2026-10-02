import { defineComponent as _defineComponent } from 'vue';

import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { ref } from 'vue';

const _sfc_main = /* @__PURE__ */ _defineComponent({ __name: 'ts-props', setup(__props) {
	const item = ref({ name: 'a' });
	const shout = (s) => s.toUpperCase();
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('p', null, _toDisplayString(shout(item.value.name)), 1);
	};
} });

export default _sfc_main;
