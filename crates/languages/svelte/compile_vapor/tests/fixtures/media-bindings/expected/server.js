import { defineComponent as $$v_defineComponent, normalizeStyle as $$v_normalizeStyle } from 'vue';

import { shallowRef as $$ref } from 'vue';

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
	const video = $$ref();
	const time = $$ref(0);
	const duration = $$ref();
	const volume = $$ref();
	const muted = $$ref();
	const paused = $$ref();
	const rate = $$ref();
	const buffered = $$ref();
	const seekable = $$ref();
	const played = $$ref();
	const seeking = $$ref();
	const ended = $$ref();
	const ready = $$ref();
	const width = $$ref();
	const height = $$ref();
	function inspect() {
		return `${video.value.currentTime}:${video.value.volume}:${video.value.muted}:${video.value.playbackRate}`;
	}
	const observed = $$ref('');
	function dispatch() {
		video.value.currentTime = 8;
		video.value.volume = 0.25;
		video.value.muted = false;
		video.value.playbackRate = 0.5;
		for (const event of ['timeupdate', 'volumechange', 'ratechange', 'durationchange', 'loadedmetadata', 'seeking', 'seeked', 'ended', 'resize']) video.value.dispatchEvent(new Event(event));
	}
	return { renderContent: ($$ssr_parent) => $$join([$$join(['<video', '>', $$join([]), '</video>']), ' ', $$join(['<button', ' class="write"', '>', $$join(['write']), '</button>']), ' ', $$join(['<button', ' class="inspect"', '>', $$join(['inspect']), '</button>']), ' ', $$join(['<button', ' class="event"', '>', $$join(['event']), '</button>']), ' ', $$join(['<p', '>', $$join([$$escape(`${String(time.value ?? '')}:${String(String(duration.value) ?? '')}:${String(volume.value ?? '')}:${String(muted.value ?? '')}:${String(paused.value ?? '')}:${String(rate.value ?? '')}:${String(buffered.value?.length ?? '')}:${String(seekable.value?.length ?? '')}:${String(played.value?.length ?? '')}:${String(seeking.value ?? '')}:${String(ended.value ?? '')}:${String(ready.value ?? '')}:${String(width.value ?? '')}:${String(height.value ?? '')}:${String(observed.value ?? '')}`)]), '</p>'])]) };
} });
