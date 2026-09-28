import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<nav class="svelte-1xi6f9v"><a href="/">home</a> <a href="/about">about</a></nav> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}