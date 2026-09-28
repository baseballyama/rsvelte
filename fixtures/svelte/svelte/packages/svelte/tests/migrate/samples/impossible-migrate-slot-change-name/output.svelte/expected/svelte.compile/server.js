import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let body;

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'body', {}, null);
	$$renderer.push(`<!--]-->`);
}