import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'dashed-name', {}, null);
	$$renderer.push(`<!--]-->`);
}