import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'dashed-name', {}, null);
	$$renderer.push(`<!--]-->`);
}