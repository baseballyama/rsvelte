import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'props', props: { label: { default: 'Count' }, start: { default: 0 }, step: { default: 1 } }, setup(__props) {
	const $$props = __props;
	const count = $$ref($$props.start);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('button', { class: 'bump', onClick: _cache[0] || (_cache[0] = () => count.value += $$props.step) }, _toDisplayString(`${$$props.label ?? ''}`) + ': ' + _toDisplayString(`${count.value ?? ''}`), 1);
	};
} });

export default _sfc_main;
