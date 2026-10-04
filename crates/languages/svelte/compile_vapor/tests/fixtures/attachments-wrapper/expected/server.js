import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle, unref as $$v_unref } from 'vue';

import { useAttrs as $$useAttrs } from 'vue';

const $$rest_props = (attrs) => new Proxy(attrs, { get(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') return target.__rsvelte_attachments?.[key];
	return Reflect.get(target, key);
}, has(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') return key in (target.__rsvelte_attachments ?? {});
	return key !== '__rsvelte_attachments' && Reflect.has(target, key);
}, ownKeys(target) {
	return Reflect.ownKeys(target).filter((key) => key !== '__rsvelte_attachments').concat(Object.getOwnPropertySymbols(target.__rsvelte_attachments ?? {}));
}, getOwnPropertyDescriptor(target, key) {
	if (typeof key === 'symbol' && key.description === '@attach') {
		const value = target.__rsvelte_attachments?.[key];
		if (key in (target.__rsvelte_attachments ?? {})) return { configurable: true, enumerable: true, value };
		return undefined;
	}
	if (key === '__rsvelte_attachments') return undefined;
	return Reflect.getOwnPropertyDescriptor(target, key);
} });

import Child from '../attachments-child/input.svelte';

import { ssrRenderComponent as $$ssr_component } from 'vue/server-renderer';

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

export default $$v_defineComponent({ inheritAttrs: false, props: {}, ssrRender(_ctx, _push, _parent) {
	_push(_ctx.renderContent(_parent));
}, setup(__props) {
	const $$props = __props;
	const $$attrs = $$rest_props($$useAttrs());
	return { renderContent: ($$ssr_parent) => $$join([$$ssr_component($$v_unref(Child), { ...$$v_unref($$attrs) }, null, $$ssr_parent)]) };
} });
