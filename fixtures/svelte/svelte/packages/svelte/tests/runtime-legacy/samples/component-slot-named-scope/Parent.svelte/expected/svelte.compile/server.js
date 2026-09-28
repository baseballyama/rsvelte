import * as $ from 'svelte/internal/server';

export default function Parent($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'item', { item: 1 }, null);
	$$renderer.push(`<!--]-->`);
}