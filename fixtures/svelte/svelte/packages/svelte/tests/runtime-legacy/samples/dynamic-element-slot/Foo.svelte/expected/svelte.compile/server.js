import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	$$renderer.push(`<h1>Foo</h1> <div id="default"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div> <div id="other"><!--[-->`);
	$.slot($$renderer, $$props, 'other', {}, null);
	$$renderer.push(`<!--]--></div>`);
}