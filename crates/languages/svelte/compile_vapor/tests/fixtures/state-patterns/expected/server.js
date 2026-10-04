import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, shallowRef as $$shallowRef } from 'vue';

const $$destructure_array = (value, count = Infinity) => {
	if (Array.isArray(value)) return value;
	const result = [];
	if (count === 0) return result;
	for (const item of value) {
		result.push(item);
		if (result.length === count) break;
	}
	return result;
};

const $$destructure_rest = (value, excluded) => {
	if (value == null) throw new TypeError('Cannot destructure null or undefined');
	const keys = new Set(excluded.map((key) => typeof key === 'symbol' ? key : String(key)));
	const result = {};
	for (const key in value) {
		if (!keys.has(key)) result[key] = value[key];
	}
	Object.getOwnPropertySymbols(value).forEach((key) => {
		if (!keys.has(key) && Object.propertyIsEnumerable.call(value, key)) result[key] = value[key];
	});
	return result;
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
	const $$pattern_base_23 = $$ref({ deep: {}, list: [undefined, 4, 5], unused: 6 }), $$pattern_23 = $$ref($$pattern_base_23.value), $$pattern_3 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 1 : $$pattern_default)($$pattern_23.value['n'])), n = $$ref($$pattern_3.value), $$pattern_11 = $$ref($$pattern_23.value['deep']), $$pattern_9 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 2 : $$pattern_default)($$pattern_11.value['value'])), value = $$ref($$pattern_9.value), $$pattern_19 = $$ref($$destructure_array($$pattern_23.value['list'])), $$pattern_16 = $$ref((($$pattern_default) => $$pattern_default === undefined ? 3 : $$pattern_default)($$pattern_19.value[0])), first = $$ref($$pattern_16.value), remaining = $$ref($$pattern_19.value.slice(1)), rest = $$ref($$destructure_rest($$pattern_23.value, ['n', 'deep', 'list']));
	const $$pattern_base_45 = $$shallowRef([10, 20, 30]), $$pattern_45 = $$shallowRef($$destructure_array($$pattern_base_45.value)), a = $$shallowRef($$pattern_45.value[0]), tail = $$shallowRef($$pattern_45.value.slice(2));
	const $$pattern_base_62 = $$ref({}), $$pattern_62 = $$ref($$pattern_base_62.value), $$pattern_60 = $$ref((($$pattern_default) => $$pattern_default === undefined ? () => n.value : $$pattern_default)($$pattern_62.value['read'])), read = $$ref($$pattern_60.value);
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', '>', $$join(['deep']), '</button>']), ' ', $$join(['<button', '>', $$join(['raw']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(n.value ?? '')}:${String(value.value ?? '')}:${String(first.value ?? '')}:${String(remaining.value.join(',') ?? '')}:${String(JSON.stringify(rest.value) ?? '')}`)]), '</p>']), ' ', $$join(['<output', '>', $$join([$$escape(`${String(a.value ?? '')}:${String(tail.value.join(',') ?? '')}:${String(read.value() ?? '')}`)]), '</output>'])]) };
} });
