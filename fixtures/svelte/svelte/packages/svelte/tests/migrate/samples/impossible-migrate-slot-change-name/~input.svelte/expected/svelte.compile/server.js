import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let body;

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'body', {}, null);
	$$renderer.push(`<!--]-->`);
}