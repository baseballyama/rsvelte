import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let b = 7;

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', { a: b }, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', { b }, null);
	$$renderer.push(`<!--]--></div>`);
}