import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'main', {}, null);
	$$renderer.push(`<!--]-->`);
}