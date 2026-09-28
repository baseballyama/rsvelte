import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let fooText = 'foo';

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', { someText: fooText }, null);
	$$renderer.push(`<!--]--></div>`);
}