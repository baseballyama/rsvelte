import { unref as _unref, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue';

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
	const $$ws = [32, 9, 10, 13, 12, 160, 11, 65279].map((c) => String.fromCharCode(c));
	const $$remove_class = (name, key, a) => {
		const at = name.indexOf(key, a);
		if (at < 0) return name;
		const b = at + key.length;
		if ((at === 0 || $$ws.includes(name[at - 1])) && (b === name.length || $$ws.includes(name[b]))) {
			const head = at === 0 ? '' : name.substring(0, at);
			return $$remove_class(head + name.substring(b + 1), key, at);
		}
		return $$remove_class(name, key, b);
	};
	const $$to_class = (value, directives) => {
		let name = value == null ? '' : '' + value;
		if (directives) {
			Object.keys(directives).forEach((key) => {
				if (directives[key]) name = name ? name + ' ' + key : key; else if (name.length) name = $$remove_class(name, key, 0);
			});
		}
		return name === '' ? null : name;
	};
	const $$setters_cache = new Map();
	const $$collect_setters = (proto, setters) => {
		if (proto === Element.prototype) return setters;
		const descriptors = Object.getOwnPropertyDescriptors(proto);
		Object.keys(descriptors).forEach((key) => {
			if (descriptors[key].set && key !== 'innerHTML' && key !== 'textContent' && key !== 'innerText') setters.add(key);
		});
		return $$collect_setters(Object.getPrototypeOf(proto), setters);
	};
	const $$setters = (el) => {
		const id = el.getAttribute('is') || el.nodeName;
		let setters = $$setters_cache.get(id);
		if (setters) return setters;
		$$setters_cache.set(id, setters = new Set());
		return $$collect_setters(el, setters);
	};
	const $$uninitialized = Symbol();
	const $$set_attribute = (el, name, value) => {
		const cache = el.$$attributes;
		if (cache[name] === (cache[name] = value)) return;
		if (value == null) el.removeAttribute(name); else if (typeof value !== 'string' && $$setters(el).has(name)) el[name] = value; else el.setAttribute(name, value);
	};
	const $$aliases = { formnovalidate: 'formNoValidate', ismap: 'isMap', nomodule: 'noModule', playsinline: 'playsInline', readonly: 'readOnly', defaultvalue: 'defaultValue', defaultchecked: 'defaultChecked', srcobject: 'srcObject', novalidate: 'noValidate', allowfullscreen: 'allowFullscreen', disablepictureinpicture: 'disablePictureInPicture', disableremoteplayback: 'disableRemotePlayback' };
	const $$delegated = ['beforeinput', 'click', 'change', 'dblclick', 'contextmenu', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'pointerdown', 'pointermove', 'pointerout', 'pointerover', 'pointerup', 'touchend', 'touchmove', 'touchstart'];
	const $$set_event = (el, current, key, value, prev_value) => {
		let name = key.slice(2);
		const delegated = $$delegated.includes(name);
		const capture = name.endsWith('capture') && name !== 'gotpointercapture' && name !== 'lostpointercapture';
		if (capture) name = name.slice(0, -7);
		const opts = capture ? { capture: true } : {};
		if (!delegated && prev_value) {
			if (value != null) return;
			el.removeEventListener(name, current['$$' + key], opts);
			current['$$' + key] = null;
		}
		if (delegated) {
			el['__' + name] = value;
			if (el['$$delegate_' + name]) return;
			el['$$delegate_' + name] = true;
			el.addEventListener(name, (evt) => {
				const handler = el['__' + name];
				if (handler != null && (!el.disabled || evt.target === el)) {
					if (Array.isArray(handler)) handler[0].apply(el, [evt, ...handler.slice(1)]); else handler.call(el, evt);
				}
			}, { passive: name === 'touchstart' || name === 'touchmove' });
		} else if (value != null) {
			const handle = function (evt) {
				if (!evt.cancelBubble) current[key].call(this, evt);
			};
			current['$$' + key] = handle;
			if (name.startsWith('pointer') || name.startsWith('touch') || name === 'wheel') {
				queueMicrotask(() => el.addEventListener(name, handle, opts));
			} else {
				el.addEventListener(name, handle, opts);
			}
		}
	};
	const $$set_key = (el, cache, prev, current, setters, key, value) => {
		if (key === 'class') {
			if (el.$$class !== value || el.$$class === undefined) {
				const name = $$to_class(value);
				if (name == null) el.removeAttribute('class'); else el.className = name;
				el.$$class = value;
			}
			current[key] = value;
			return;
		}
		if (key === 'style') {
			if (el.$$style !== value) {
				if (value == null) el.removeAttribute('style'); else el.style.cssText = String(value);
				el.$$style = value;
			}
			current[key] = value;
			return;
		}
		const prev_value = current[key];
		if (value === prev_value && !(value === undefined && el.hasAttribute(key))) return;
		current[key] = value;
		const prefix = key[0] + key[1];
		if (prefix === '$$') return;
		if (prefix === 'on') {
			$$set_event(el, current, key, value, prev_value);
		} else if (key === 'autofocus') {
			if (value) {
				const body = document.body;
				el.autofocus = true;
				queueMicrotask(() => {
					if (document.activeElement === body) el.focus();
				});
			}
		} else if (key === '__value' || key === 'value' && value != null) {
			el.value = el.__value = value;
		} else {
			const lower = key.toLowerCase();
			const name = $$aliases[lower] ?? lower;
			const is_default = name === 'defaultValue' || name === 'defaultChecked';
			if (value == null && !is_default) {
				cache[key] = null;
				if (name === 'value') {
					const previous = el.defaultValue;
					el.removeAttribute(name);
					el.defaultValue = previous;
					el.value = el.__value = prev === undefined ? previous : null;
				} else if (name === 'checked') {
					const previous = el.defaultChecked;
					el.removeAttribute(name);
					el.defaultChecked = previous;
					el.checked = prev === undefined ? previous : false;
				} else {
					el.removeAttribute(key);
				}
			} else if (is_default || typeof value !== 'string' && setters.has(name)) {
				el[name] = value;
				if (name in cache) cache[name] = $$uninitialized;
			} else if (typeof value !== 'function') {
				$$set_attribute(el, name, value);
			}
		}
	};
	const $$attributes = (el, next) => {
		el.$$attributes ??= {};
		const prev = el.$$prev;
		const current = prev || {};
		if (prev) {
			Object.keys(prev).forEach((key) => {
				if (!(key in next) && key[0] + key[1] !== '$$') next[key] = null;
			});
		}
		if (next.class) next.class = $$sclsx(next.class);
		const setters = $$setters(el);
		Object.keys(next).forEach((key) => $$set_key(el, el.$$attributes, prev, current, setters, key, next[key]));
		if (Object.getOwnPropertySymbols(next).some((s) => s.description === '@attach')) {
			$$fail('an attachment in a spread attribute');
		}
		el.$$prev = current;
	};
	const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), 'vuelte: ' + message, { value: 0 });
	return (_ctx, _cache) => {
		return _openBlock(), _createElementBlock('p', { ref: ($$el) => {
			if ($$el !== null) {
				$$attributes($$el, { 'class': ['inner', $$props.class], ..._unref($$attrs) });
			}
		} }, 'root', 512);
	};
} });

export default _sfc_main;
