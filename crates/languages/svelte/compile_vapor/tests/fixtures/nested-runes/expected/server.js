import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle, unref as $$v_unref } from 'vue';

import { shallowRef as $$ref, customRef as $$createState, shallowRef as $$shallowRef, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

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
	function counter(initial) {
		let value = $$ref(initial);
		let raw = $$shallowRef({ step: 1 });
		let double = $$computed(() => value.value * 2);
		let $$pattern_base_30 = $$ref([3, 4, 5]), $$pattern_30 = $$ref($$destructure_array($$pattern_base_30.value)), offset = $$ref($$pattern_30.value[0]), rest = $$ref($$pattern_30.value.slice(1));
		let $$pattern_base_42 = $$computed(() => ({ total: value.value + offset.value })), $$pattern_42 = $$computed(() => $$pattern_base_42.value), total = $$computed(() => $$pattern_42.value['total']);
		return { get value() {
			return value.value;
		}, get double() {
			return double.value;
		}, get total() {
			return total.value;
		}, get rest() {
			return rest.value.join(',');
		}, increase() {
			value.value += raw.value.step;
			offset.value++;
			raw.value = { step: 2 };
		} };
	}
	const first = counter(1);
	const second = counter(10);
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', ' id="first"', '>', $$join(['first']), '</button>']), ' ', $$join(['<button', ' id="second"', '>', $$join(['second']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String($$v_unref(first).value ?? '')}:${String($$v_unref(first).double ?? '')}:${String($$v_unref(first).total ?? '')}:${String($$v_unref(first).rest ?? '')}`)]), '</p>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String($$v_unref(second).value ?? '')}:${String($$v_unref(second).double ?? '')}:${String($$v_unref(second).total ?? '')}:${String($$v_unref(second).rest ?? '')}`)]), '</p>'])]) };
} });
