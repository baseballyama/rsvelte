import { unref as _unref, normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

import { useAttrs as $$useAttrs } from 'vue';

const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, { __name: 'fallthrough', props: { class: {} }, setup(__props) {
	const $$props = __props;
	const $$attrs = $$useAttrs();
	const $$keys = (o, seen = [], out = []) => {
		if (o == null) return out;
		Object.getOwnPropertyNames(o).forEach((k) => {
			if (seen.indexOf(k) < 0) {
				seen.push(k);
				if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);
			}
		});
		return $$keys(Object.getPrototypeOf(o), seen, out);
	};
	const $$clsx = (mix) => {
		if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;
		if (typeof mix !== 'object' || mix === null) return '';
		if (Array.isArray(mix)) {
			return Array.from({ length: mix.length }, (_, k) => mix[k]).filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');
		}
		return $$keys(mix).filter((k) => mix[k]).join(' ');
	};
	const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';
	const $$booleans = ['allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'disabled', 'formnovalidate', 'indeterminate', 'inert', 'ismap', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'webkitdirectory', 'defer', 'disablepictureinpicture', 'disableremoteplayback'];
	const $$invalid_name = (name) => name === '' || Array.from(name).some((ch) => {
		const c = ch.codePointAt(0);
		return ch.trim() === '' || ['\'', '"', '>', '/', '='].includes(ch) || c >= 64976 && c <= 65007 || (c & 65534) === 65534;
	});
	const $$spread_key = (out, key, value) => {
		if (typeof value === 'function') return;
		if (key[0] === '$' && key[1] === '$') return;
		if ($$invalid_name(key)) return;
		const name = key.toLowerCase();
		if (name.length > 2 && name.startsWith('on')) return;
		const boolean = name === 'hidden' && value !== 'until-found' || $$booleans.includes(name);
		if (value == null || boolean && !value && value !== '') return;
		if ('^' + name in out) return;
		if (boolean) {
			out['^' + name] = true;
			return;
		}
		const replaced = name === 'translate' && (value === true ? 'yes' : value === false ? 'no' : '');
		const text = String(replaced || value);
		if ((name === 'itemscope' || name === 'scoped') && text !== '') {
			$$fail('Vue renders `' + name + '` as a boolean attribute');
		}
		out['^' + name] = text;
	};
	const $$spread = (attrs, events) => {
		if (attrs.class) attrs.class = $$sclsx(attrs.class);
		const out = {};
		Object.keys(attrs).forEach((key) => $$spread_key(out, key, attrs[key]));
		if (events) events.forEach((e) => {
			out['^' + e] = 'this.__e=event';
		});
		return out;
	};
	const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), 'vuelte: ' + message, { value: 0 });
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('p', _normalizeProps(_guardReactiveProps($$spread({ 'class': $$sclsx(['inner', $$props.class]), ..._unref($$attrs) }))), 'root', 16);
	};
} });

export default _sfc_main;
