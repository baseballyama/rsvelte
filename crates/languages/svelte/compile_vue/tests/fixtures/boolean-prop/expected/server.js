import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'boolean-prop', props: { flag: { default: false }, shown: { default: false } }, setup(__props) {
	const $$props = __props;
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('p', null, 'flag ' + _toDisplayString(String(String($$props.flag) ?? '')) + ', shown ' + _toDisplayString(String(String($$props.shown) ?? '')), 1);
	};
} });

export default _sfc_main;
