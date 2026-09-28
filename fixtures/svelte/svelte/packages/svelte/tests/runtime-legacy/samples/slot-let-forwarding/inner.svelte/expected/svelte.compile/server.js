import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'x', { foo: 5 }, null);
	$$renderer.push(`<!--]--></div>`);
}