import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$style = (element, name, value, important) => {
	if (value == null || value === '') element.style.removeProperty(name); else element.style.setProperty(name, value, important ? 'important' : '');
};

const $$style_value = (value, important) => value == null ? null : value + (important ? ' !important' : '');

const $$styles = (element, value, declarations) => {
	const changed = element.$$style_base !== value;
	if (changed) {
		element.$$style_base = value;
		const style = element.ownerDocument.createElement('div').style;
		style.cssText = value == null ? '' : String(value);
		const properties = Array.from(style);
		Object.keys(declarations).forEach((name) => {
			if (properties.includes(name)) style.removeProperty(name);
		});
		let css = style.cssText;
		Object.entries(declarations).forEach(([name, [value, important]]) => {
			if (value != null && value !== '') css += name + ':' + value + (important ? ' !important;' : ';');
		});
		if (css) element.style.cssText = css; else element.removeAttribute('style');
	}
	const previous = element.$$style_declarations;
	Object.keys(declarations).forEach((name) => {
		const [value, important] = declarations[name];
		if (!changed && (!previous || previous[name][0] !== value || previous[name][1] !== important)) {
			$$style(element, name, value, important);
		}
	});
	element.$$style_declarations = declarations;
};

const $$style_spread = (element, attributes, declarations) => {
	if (element) {
		const base = attributes.style;
		delete attributes.style;
		$$attributes(element, attributes);
		$$styles(element, base, declarations);
	} else {
		const style = $$v_normalizeStyle([attributes.style]) || {};
		Object.entries(declarations).forEach(([name, [value, important]]) => {
			if (value == null || value === '') delete style[name]; else style[name] = $$style_value(value, important);
		});
		attributes.style = Object.entries(style).map(([name, value]) => name + ':' + value).join(';');
	}
	return attributes;
};

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
	const active = $$ref(false);
	const color = $$computed(() => active.value ? 'red' : 'blue');
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', '>', $$join(['toggle']), '</button>']), ' ', $$join(['<p', $$styles_text(['color:black;padding:1px', { 'color': color.value }, { '--gap': $$style_value(active.value ? '2px' : null, true) }, { 'margin': active.value ? '3px' : null }]), '>', $$join(['styles']), '</p>'])]) };
} });
