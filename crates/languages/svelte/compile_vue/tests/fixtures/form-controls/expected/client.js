import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

const _hoisted_1 = { class: 'summary' };

import { ref as $$ref } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'form-controls', setup(__props) {
	const $$value = (el, v) => {
		const last = el.$$value;
		el.$$value = v ?? undefined;
		if (last === el.$$value || el.value === v) return;
		el.value = v ?? '';
	};
	const $$select = (el, value, set) => {
		const mounting = el.$$mounted !== true;
		el.$$mounted = true;
		const o = Array.prototype.find.call(el.options, (o) => Object.is(o.value, value));
		if (o !== undefined) o.selected = true; else if (!mounting || value !== undefined) el.selectedIndex = -1;
		if (mounting && value === undefined) {
			const checked = el.querySelector(':checked');
			if (checked !== null) set(checked.value);
		}
	};
	const $$option = (el) => {
		const o = el.querySelector(':checked') ?? el.querySelector('option:not([disabled])');
		return o && o.value;
	};
	const size = $$ref('m');
	const note = $$ref('none');
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock(_Fragment, null, [_createElementVNode('select', { class: 'size', onChange: _cache[0] || (_cache[0] = ($$e) => size.value = $$option($$e.currentTarget)), ref: ($$el) => {
			if ($$el !== null) {
				$$select($$el, size.value, ($$v) => size.value = $$v);
			}
		} }, [..._cache[2] || (_cache[2] = [_createElementVNode('option', { value: 's' }, 'small', -1), _createElementVNode('option', { value: 'm' }, 'medium', -1), _createElementVNode('option', { value: 'l' }, 'large', -1)])], 544), _createElementVNode('input', { class: 'note', onChange: _cache[1] || (_cache[1] = (e) => note.value = e.currentTarget.value), ref: ($$el) => {
			if ($$el !== null) {
				$$value($$el, note.value);
			}
		} }, null, 544), _cache[3] || (_cache[3] = _createTextVNode()), _createElementVNode('p', _hoisted_1, 'size ' + _toDisplayString(`${size.value ?? ''}`) + ', note ' + _toDisplayString(`${note.value ?? ''}`), 1)], 64);
	};
} });

export default _sfc_main;
