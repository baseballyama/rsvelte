import { createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'status' };

const _hoisted_2 = ['disabled'];

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'checkbox', setup(__props) {
	const $$once = (el, f) => {
		if (el.$$once === true) return;
		el.$$once = true;
		f();
	};
	const agreed = $$ref(false);
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('label', null, [_createElementVNode('input', { type: 'checkbox', class: 'agree', onChange: _cache[0] || (_cache[0] = ($$e) => agreed.value = $$e.currentTarget.checked), ref: ($$el) => {
			if ($$el !== null) {
				$$once($$el, () => agreed.value == null && (agreed.value = $$el.checked));
				$$el.checked = Boolean(agreed.value);
			}
		} }, null, 544), _cache[1] || (_cache[1] = _createTextVNode(' I agree', -1))]), _cache[2] || (_cache[2] = _createTextVNode()), _createElementVNode('p', _hoisted_1, _toDisplayString(`${(agreed.value ? 'agreed' : 'not yet') ?? ''}`), 1), _cache[3] || (_cache[3] = _createTextVNode()), _createElementVNode('button', { class: 'submit', disabled: !agreed.value }, 'continue', 8, _hoisted_2)], 64);
	};
} });

export default _sfc_main;
