import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle, unref as $$v_unref } from 'vue';

import { shallowRef as $$ref } from 'vue';

const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : Array.isArray(c) ? c : Array.prototype.slice.call(c);

import Child from '../component-snippets-child/input.svelte';

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

export default $$v_defineComponent({ inheritAttrs: false, ssrRender(_ctx, _push, _parent) {
	_push(_ctx.renderContent(_parent));
}, setup(__props) {
	const count = $$ref(1);
	const visible = $$ref(true);
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', ' class="count"', '>', $$join([$$escape(`count ${String(count.value ?? '')}`)]), '</button>']), ' ', $$join(['<button', ' class="toggle"', '>', $$join(['toggle']), '</button>']), ' ', visible.value ? (() => {
		function $$snippet_3(value) {
			return $$join([$$join(['<h2', '>', $$join([$$escape(`header ${String(value ?? '')}/${String(count.value ?? '')}`)]), '</h2>'])]);
		}
		function $$children_10() {
			return $$join([$$join(['<p', '>', $$join([$$escape(`children ${String(count.value ?? '')}`)]), '</p>'])]);
		}
		return $$ssr_component($$v_unref(Child), { 'value': count.value, 'header': $$snippet_3, 'children': $$children_10 }, null, $$ssr_parent);
	})() : '', ' ', $$join($$each([1, 2]).map((item) => (() => {
		function $$snippet_6(value) {
			return $$join([$$join(['<h3', '>', $$join([$$escape(`${String(item ?? '')}/${String(value ?? '')}/${String(count.value ?? '')}`)]), '</h3>'])]);
		}
		function $$children_27() {
			return $$join([$$join(['<span', '>', $$join([$$escape(`${String(item ?? '')}/${String(count.value ?? '')}`)]), '</span>'])]);
		}
		return $$ssr_component($$v_unref(Child), { 'value': item, 'header': $$snippet_6, 'children': $$children_27 }, null, $$ssr_parent);
	})()))]) };
} });
