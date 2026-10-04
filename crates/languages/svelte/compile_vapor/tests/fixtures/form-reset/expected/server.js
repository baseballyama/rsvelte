import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect, watch as $$watch, onScopeDispose as $$onScopeDispose } from 'vue';

const $$attr = (v) => v == null ? null : String(v);

const $$bool = (v) => v === '' || Boolean(v);

const $$select = (element, value, setter) => {
	const mounting = element.$$mounted !== true;
	element.$$mounted = true;
	if (element.multiple) {
		if (mounting && value === undefined) setter($$option(element)); else Array.from(element.options).forEach((option) => {
			option.selected = value != null && value.includes(option.value);
		});
		return;
	}
	const option = Array.from(element.options).find((option) => Object.is(option.value, value));
	if (option !== undefined) option.selected = true; else if (!mounting || value !== undefined) element.selectedIndex = -1;
	if (mounting && value === undefined) {
		const selected = element.querySelector(':checked');
		if (selected !== null) setter(selected.value);
	}
};

const $$selected = (value, option) => value != null && value.includes(option);

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
	const text = $$ref('first');
	const adopted = $$ref();
	const number = $$ref(1);
	const checked = $$ref(false);
	const adoptedChecked = $$ref();
	const selected = $$ref('a');
	const multiple = $$ref(['a']);
	const group = $$ref(['a']);
	const radio = $$ref('a');
	const cancelled = $$ref(false);
	const form = $$ref();
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<form', '>', $$join([$$join(['<input', ' class="text"', $$attribute('value', $$attr(text.value)), '>']), ' ', $$join(['<input', ' class="adopted"', $$attribute('value', $$attr(adopted.value)), '>']), ' ', $$join(['<input', ' class="number"', ' type="number"', $$attribute('value', $$attr(number.value)), '>']), ' ', $$join(['<input', ' class="checked"', ' type="checkbox"', $$attribute('checked', $$bool(checked.value)), '>']), ' ', $$join(['<input', ' class="adopted-checked"', ' type="checkbox"', $$attribute('checked', $$bool(adoptedChecked.value)), '>']), ' ', $$join(['<select', ' class="single"', '>', $$join([$$join(['<option', ' value="a"', $$attribute('selected', selected.value === 'a'), '>', $$join(['a']), '</option>']), $$join(['<option', ' value="b"', $$attribute('selected', selected.value === 'b'), '>', $$join(['b']), '</option>'])]), '</select>']), ' ', $$join(['<select', ' class="multiple"', ' multiple', '>', $$join([$$join(['<option', ' value="a"', ' selected', $$attribute('selected', $$selected(multiple.value, 'a')), '>', $$join(['a']), '</option>']), $$join(['<option', ' value="b"', $$attribute('selected', $$selected(multiple.value, 'b')), '>', $$join(['b']), '</option>'])]), '</select>']), ' ', $$join(['<input', ' class="group"', ' type="checkbox"', ' value="a"', $$attribute('checked', $$group_checked(group.value, 'a', true)), '>']), ' ', $$join(['<input', ' class="group"', ' type="checkbox"', ' value="b"', $$attribute('checked', $$group_checked(group.value, 'b', true)), '>']), ' ', $$join(['<input', ' class="radio"', ' type="radio"', ' value="a"', $$attribute('checked', $$group_checked(radio.value, 'a', false)), '>']), ' ', $$join(['<input', ' class="radio"', ' type="radio"', ' value="b"', $$attribute('checked', $$group_checked(radio.value, 'b', false)), '>']), ' ', $$join(['<button', ' class="reset"', ' type="reset"', '>', $$join(['reset']), '</button>'])]), '</form>']), ' ', $$join(['<button', ' class="program"', '>', $$join(['program reset']), '</button>']), ' ', $$join(['<button', ' class="cancel"', '>', $$join(['cancel']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(text.value ?? '')}:${String(adopted.value ?? '')}:${String(number.value ?? '')}:${String(typeof number.value ?? '')}:${String(checked.value ?? '')}:${String(adoptedChecked.value ?? '')}:${String(selected.value ?? '')}:${String(multiple.value.join(',') ?? '')}:${String(group.value.join(',') ?? '')}:${String(radio.value ?? '')}:${String(cancelled.value ?? '')}`)]), '</p>'])]) };
} });
