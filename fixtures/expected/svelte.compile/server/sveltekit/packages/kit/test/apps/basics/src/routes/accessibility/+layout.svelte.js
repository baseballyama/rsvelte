import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<button>focus me</button> <nav><a href="/accessibility/a">a</a> <a href="/accessibility/b">b</a> <a href="/accessibility/autofocus/a">autofocus/a</a> <a href="/accessibility/autofocus/b">autofocus/b</a></nav> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}