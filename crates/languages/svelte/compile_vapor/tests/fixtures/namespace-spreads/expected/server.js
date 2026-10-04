import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

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

const $$spread_key = (out, key, value, preserve, html) => {
	if (typeof value === 'function') return;
	if (key[0] === '$' && key[1] === '$') return;
	if ($$invalid_name(key)) return;
	const lower = key.toLowerCase();
	const name = preserve ? key : lower;
	if (lower.length > 2 && lower.startsWith('on')) return;
	const boolean = html && (name === 'hidden' && value !== 'until-found' || $$booleans.includes(name));
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

const $$spread = (attrs, events, preserve = false, html = true) => {
	if (attrs.class) attrs.class = $$sclsx(attrs.class);
	const out = {};
	Object.keys(attrs).forEach((key) => $$spread_key(out, key, attrs[key], preserve, html));
	if (events) events.forEach((e) => {
		out['^' + e] = 'this.__e=event';
	});
	return out;
};

const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), 'vuelte: ' + message, { value: 0 });

const $$make_derived = (server) => (getter) => {
	let value;
	let ready = false;
	if (server) {
		let override;
		return { get value() {
			if (override != null) return override;
			if (!ready) {
				value = getter();
				ready = true;
			}
			return value;
		}, set value(next) {
			override = next;
		} };
	}
	const effect = new $$ReactiveEffect(getter);
	const source = $$createState((track, trigger) => {
		let overridden = false;
		effect.notify = () => {
			if (effect.dirty) {
				ready = false;
				overridden = false;
				trigger();
			}
		};
		const read = () => {
			if (!ready && !overridden) {
				value = effect.run();
				ready = true;
			}
			return value;
		};
		return { get() {
			track();
			return read();
		}, set(next) {
			const previous = read();
			value = next;
			overridden = true;
			if (!Object.is(previous, next)) trigger();
		} };
	});
	return $$createDerived({ get: () => source.value, set: (next) => {
		source.value = next;
	} });
};

const $$computed = $$make_derived(true);

const $$boolean_names = ['allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'disabled', 'formnovalidate', 'indeterminate', 'inert', 'ismap', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'seamless', 'selected', 'webkitdirectory', 'defer', 'disablepictureinpicture', 'disableremoteplayback'];

const $$escape = (value) => String(value == null ? '' : value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

const $$boolean_attributes = new Set($$boolean_names);

const $$attribute = (name, value, html = true) => {
	if (value == null) return '';
	if (html && ($$boolean_attributes.has(name) || name === 'hidden' && value !== 'until-found')) return value || value === '' ? ' ' + name : '';
	return ' ' + name + '="' + $$escape(value) + '"';
};

const $$attributes_text = (object, html = true) => Object.keys(object).map((key) => $$attribute(key[0] === '^' ? key.slice(1) : key, object[key], html)).join('');

const $$styles_text = (values) => {
	const declarations = $$v_normalizeStyle(values);
	const text = Object.keys(declarations).filter((key) => declarations[key] != null).map((key) => key + ':' + declarations[key]).join(';');
	return $$attribute('style', text);
};

const $$update_head = (context) => {
	context.head = (context.__vaporHead || '') + (context.__vaporTitle || '') + (context.__vaporStyles || '');
};

const $$render_css = (context, hash, code) => {
	if (context) {
		const styles = context.__vaporCss ??= new Set();
		if (!styles.has(hash)) {
			styles.add(hash);
			context.__vaporStyles = (context.__vaporStyles || '') + '<style id="' + hash + '">' + code + '</style>';
			$$update_head(context);
		}
	}
	return '';
};

const $$render_head = (context, content) => {
	if (content && (content.hasAsync || typeof content.then === 'function')) {
		return $$resolve_html(content).then((value) => $$render_head(context, value));
	}
	if (Array.isArray(content)) content = content.flat(Infinity).join('');
	if (context) {
		context.__vaporHead = (context.__vaporHead || '') + content;
		$$update_head(context);
	}
	return '';
};

const $$await_server = (value) => {
	if (value != null && typeof value.then === 'function') {
		value.then(null, () => {});
		return { status: 0 };
	}
	return { status: 1, value };
};

const $$is_void = (tag) => ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tag);

const $$render_title = (context, value) => {
	if (context) {
		context.__vaporTitle = '<title>' + $$escape(value) + '</title>';
		$$update_head(context);
	}
	return '';
};

const $$render_destroy = (render, callbacks) => {
	try {
		return render();
	} finally {
		callbacks.forEach((callback) => callback());
		callbacks.length = 0;
	}
};

const $$content_server = (value, fallback, raw) => (raw ? value : $$escape(value)) || fallback();

const $$join = (parts) => {
	if (parts.some((part) => Array.isArray(part) || part && typeof part.then === 'function')) {
		parts.hasAsync = parts.some((part) => part && (part.hasAsync || typeof part.then === 'function'));
		return parts;
	}
	return parts.join('');
};

const $$resolve_html = async (value) => {
	value = await value;
	if (Array.isArray(value)) return (await Promise.all(value.map($$resolve_html))).join('');
	return value == null ? '' : String(value);
};

export default $$v_defineComponent({ inheritAttrs: false, ssrRender(_ctx, _push, _parent) {
	_push(_ctx.renderContent(_parent));
}, setup(__props) {
	const mode = $$ref(0);
	const sampled = $$ref('');
	const attributes = $$computed(() => mode.value === 0 ? { viewBox: '0 0 20 20', preserveAspectRatio: 'xMidYMid meet', camelCase: 'first', 'xlink:href': '#first', class: ['one', { active: true }], title: 'initial' } : mode.value === 1 ? { viewBox: '0 0 40 40', preserveAspectRatio: 'none', camelCase: 'next', 'xlink:href': '#next', class: { changed: true }, title: 'next' } : {});
	function sample() {
		sampled.value = JSON.stringify(Array.from(document.querySelectorAll('[data-case]'), (element) => [element.namespaceURI, element.getAttribute('viewBox'), element.getAttribute('viewbox'), element.getAttribute('preserveAspectRatio'), element.getAttribute('camelCase'), element.getAttribute('camelcase'), element.getAttribute('xlink:href'), element.getAttributeNS('http://www.w3.org/1999/xlink', 'href')]));
	}
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', '>', $$join(['change']), '</button>']), ' ', $$join(['<button', '>', $$join(['sample']), '</button>']), ' ', $$join(['<svg', $$attributes_text($$spread({ 'data-case': true, ...attributes.value }, undefined, true, false), false), '>', $$join([$$join(['<use', $$attributes_text($$spread({ 'data-case': true, ...attributes.value }, undefined, true, false), false), '>', $$join([]), '</use>']), $$join(['<foreignObject', '>', $$join([$$join(['<div', $$attributes_text($$spread({ 'data-case': true, ...attributes.value })), '>', $$join(['html']), '</div>'])]), '</foreignObject>'])]), '</svg>']), ' ', $$join(['<math', '>', $$join([$$join(['<mrow', $$attributes_text($$spread({ 'data-case': true, ...attributes.value }, undefined, true, false), false), '>', $$join([$$join(['<mi', '>', $$join(['x']), '</mi>'])]), '</mrow>'])]), '</math>']), ' ', $$join(['<output', '>', $$join([$$escape(String(sampled.value ?? ''))]), '</output>'])]) };
} });
