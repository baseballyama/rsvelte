import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, shallowRef as $$shallowRef } from 'vue';

const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : Array.isArray(c) ? c : Array.prototype.slice.call(c);

const $$attr = (v) => v == null ? null : String(v);

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
	const count = $$ref(0);
	const visible = $$ref(true);
	const template = $$shallowRef();
	const observed = $$ref('');
	function sample() {
		const root = template.value.content;
		observed.value = JSON.stringify([root.querySelector('p').textContent, root.querySelector('p').getAttribute('title'), root.querySelector('template').content.textContent, root.querySelector('b')?.textContent ?? null, Array.from(root.querySelectorAll('li'), (element) => element.textContent)]);
	}
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', '>', $$join(['change']), '</button>']), ' ', $$join(['<button', '>', $$join(['toggle']), '</button>']), ' ', $$join(['<button', '>', $$join(['sample']), '</button>']), ' ', $$join(['<template', $$attribute('data-count', $$attr(count.value)), '>', $$join([$$join(['<p', $$attribute('title', $$attr(count.value)), '>', $$join([$$escape(`value ${String(count.value ?? '')}`)]), '</p>']), $$join(['<template', '>', $$join([$$join(['<span', '>', $$join([$$escape(`nested ${String(count.value ?? '')}`)]), '</span>'])]), '</template>']), visible.value ? $$join(['<b', '>', $$join([$$escape(`shown ${String(count.value ?? '')}`)]), '</b>']) : '', $$join(['<ul', '>', $$join([$$join($$each(Array.from({ length: count.value + 1 }, (_, index) => index)).map((index) => $$join(['<li', '>', $$join([$$escape(String(index ?? ''))]), '</li>'])))]), '</ul>'])]), '</template>']), ' ', $$join(['<output', '>', $$join([$$escape(String(observed.value ?? ''))]), '</output>'])]) };
} });
