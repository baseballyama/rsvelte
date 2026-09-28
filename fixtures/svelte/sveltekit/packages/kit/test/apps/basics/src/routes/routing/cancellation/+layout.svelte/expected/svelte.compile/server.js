import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <a href="/routing/cancellation/a">a</a> <a href="/routing/cancellation/b">b</a>`);
}