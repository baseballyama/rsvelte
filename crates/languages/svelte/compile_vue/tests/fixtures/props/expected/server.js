import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'bump' };

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'props', props: { label: { default: 'Count' }, start: { default: 0 }, step: { default: 1 } }, setup(__props) {
	const $$props = __props;
	const count = $$ref($$props.start);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('button', _hoisted_1, _toDisplayString(String($$props.label ?? '')) + ': ' + _toDisplayString(String(count.value ?? '')), 1);
	};
} });

export default _sfc_main;
