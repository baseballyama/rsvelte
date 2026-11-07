import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}