import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<a href="/snapshot/a">a</a> <a href="/snapshot/b">b</a> <a href="/snapshot/c" data-sveltekit-reload="">c</a> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}