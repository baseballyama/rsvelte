import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref } from 'vue';

const $$attr = (v) => v == null ? null : String(v);

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
	const size = $$ref(12);
	const active = $$ref(true);
	const tag = $$ref('g');
	const circle = $$ref();
	const html = $$ref();
	const dynamic = $$ref();
	const math = $$ref();
	const raw = $$ref('<rect class="raw" width="3" />');
	const observed = $$ref('');
	function inspect() {
		observed.value = [circle.value.namespaceURI, html.value.namespaceURI, dynamic.value.namespaceURI, math.value.namespaceURI, circle.value.classList.contains('active'), circle.value.getAttribute('r')].join(':');
	}
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<svg', $$attribute('viewBox', `0 0 ${size.value} ${size.value}`, false), '>', $$join([$$join(['<title', '>', $$join([$$escape(`diagram ${String(size.value ?? '')}`)]), '</title>']), $$join(['<defs', '>', $$join([$$join(['<clipPath', ' id="clip"', '>', $$join([$$join(['<rect', ' width="5"', ' height="5"', '>', $$join([]), '</rect>'])]), '</clipPath>'])]), '</defs>']), $$join(['<circle', $$attribute('class', $$to_class('circle', { 'active': active.value }), false), ' cx="5"', ' cy="5"', $$attribute('r', $$attr(size.value), false), $$attribute('fill', active.value ? 'red' : 'blue', false), '>', $$join([]), '</circle>']), $$join(['<foreignObject', '>', $$join([$$join(['<div', '>', $$join([$$escape(`html ${String(size.value ?? '')}`)]), '</div>'])]), '</foreignObject>']), (() => {
		const $$tag = tag.value;
		return $$tag ? $$join(['<', $$tag, $$attribute('data-size', $$attr(size.value), false), '>', $$is_void($$tag) ? '' : $$join([$$join([]), '</', $$tag, '>'])]) : '';
	})(), active.value ? $$join(['<g', '>', $$join([$$join(['<path', ' d="M0 0L1 1"', '>', $$join([]), '</path>'])]), '</g>']) : '', raw.value, $$join(['<use', $$attribute('xlink:href', $$attr(active.value ? '#clip' : null), false), '>', $$join([]), '</use>']), $$join(['<use', $$attribute('xlink:href', $$attr(null), false), '>', $$join([]), '</use>'])]), '</svg>']), ' ', $$join(['<math', '>', $$join([$$join(['<mrow', '>', $$join([$$join(['<mi', '>', $$join(['x']), '</mi>']), $$join(['<mo', '>', $$join(['+']), '</mo>']), $$join(['<mn', '>', $$join([$$escape(String(size.value ?? ''))]), '</mn>'])]), '</mrow>'])]), '</math>']), ' ', $$join(['<button', ' class="inspect"', '>', $$join(['inspect']), '</button>']), ' ', $$join(['<button', ' class="change"', '>', $$join(['change']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(String(observed.value ?? ''))]), '</p>'])]) };
} });
