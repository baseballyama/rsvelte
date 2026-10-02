import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let foo = 'a';

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', { foo }, null);
	$$renderer.push(`<!--]--></div>`);
}