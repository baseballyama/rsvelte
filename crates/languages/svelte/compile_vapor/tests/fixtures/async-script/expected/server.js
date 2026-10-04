import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle, withAsyncContext as $$v_withAsyncContext } from 'vue';

import { shallowRef as $$ref, customRef as $$createState, computed as $$createDerived, watchEffect as $$watchEffect, watchPostEffect as $$watchPostEffect, effectScope as $$effectScope, ReactiveEffect as $$ReactiveEffect } from 'vue';

const $$async_derived = async (getter) => ({ value: await getter() });

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

const $$server_async_context = () => {
	let restore;
	return { suspend(value) {
		const context = $$v_withAsyncContext(() => value);
		restore = context[1];
		return context[0];
	}, resume(value) {
		restore();
		return value;
	} };
};

export default $$v_defineComponent({ inheritAttrs: false, ssrRender(_ctx, _push, _parent) {
	_push(_ctx.renderContent(_parent));
}, async setup(__props) {
	const $$async_context = $$server_async_context();
	const initial = $$async_context.resume(await $$async_context.suspend(Promise.resolve(2)));
	const value = $$ref(initial);
	const double = $$async_context.resume(await $$async_context.suspend($$async_derived(async () => await Promise.resolve(value.value * 2))));
	const later = $$async_context.resume(await $$async_context.suspend($$async_derived(async () => await Promise.resolve(value.value) + value.value)));
	const simple = $$computed(() => double.value + 1);
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<button', '>', $$join(['change']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(value.value ?? '')}:${String(double.value ?? '')}:${String(later.value ?? '')}:${String(simple.value ?? '')}`)]), '</p>'])]) };
} });
