import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : Array.isArray(c) ? c : Array.prototype.slice.call(c);

const $$stringify = (v) => typeof v === 'string' ? v : v == null ? '' : v + '';

const $$groups = new WeakMap();

const $$group_checked = (value, option, checkbox) => checkbox ? value != null && value.includes(option) : value === option;

const $$group_members = new WeakMap();

const $$group = (element, owner, key, property, getter, setter, option) => {
	element.__value = option;
	const checkbox = element.type === 'checkbox';
	let groups = $$groups.get(owner);
	if (!groups) {
		groups = new Map();
		$$groups.set(owner, groups);
	}
	const name = property === null ? null : typeof property === 'symbol' ? property : String(property);
	let properties = groups.get(key);
	if (!properties) {
		properties = new Map();
		groups.set(key, properties);
	}
	let group = properties.get(name);
	if (!group) {
		group = new Set();
		properties.set(name, group);
	}
	const previous = $$group_members.get(element);
	if (previous?.group !== group) {
		if (previous) previous.dispose();
		group.add(element);
		const update = () => {
			if (checkbox) {
				const elements = Array.from(group).sort((left, right) => left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
				setter(Array.from(new Set(elements.filter((element) => element.checked).map((element) => element.__value))));
			} else setter(element.__value);
		};
		element.addEventListener('change', update);
		const record = { group, dispose() {
			group.delete(element);
			element.removeEventListener('change', update);
			if (!group.size) {
				properties.delete(name);
				if (!properties.size) groups.delete(key);
			}
			$$group_members.delete(element);
		} };
		$$group_members.set(element, record);
		if (!previous) $$onScopeDispose(() => $$group_members.get(element)?.dispose());
	}
	element.checked = $$group_checked(getter(), element.__value, checkbox);
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
	const rows = $$ref([{ id: 1, choices: [] }, { id: 2, choices: [] }]);
	const choices = $$ref({ first: [], second: [] });
	const selected = $$ref('first');
	return { renderContent: ($$ssr_parent) => $$join([$$join($$each(rows.value).map((row) => $$join([$$join(['<input', $$attribute('class', `a${$$stringify(row.id)}`), ' type="checkbox"', ' value="a"', $$attribute('checked', $$group_checked(row.choices, 'a', true)), '>']), ' ', $$join(['<input', $$attribute('class', `b${$$stringify(row.id)}`), ' type="checkbox"', ' value="b"', $$attribute('checked', $$group_checked(row.choices, 'b', true)), '>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(row.id ?? '')}:${String(row.choices.join(',') ?? '')}`)]), '</p>'])]))), ' ', $$join(['<input', ' class="dynamic-a"', ' type="checkbox"', ' value="a"', $$attribute('checked', $$group_checked(choices.value[selected.value], 'a', true)), '>']), ' ', $$join(['<input', ' class="dynamic-b"', ' type="checkbox"', ' value="b"', $$attribute('checked', $$group_checked(choices.value[selected.value], 'b', true)), '>']), ' ', $$join(['<button', ' class="switch"', '>', $$join(['switch']), '</button>']), ' ', $$join(['<button', ' class="replace"', '>', $$join(['replace']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(selected.value ?? '')}:${String(choices.value.first.join(',') ?? '')}:${String(choices.value.second.join(',') ?? '')}`)]), '</p>'])]) };
} });
