import * as $ from 'svelte/internal/server';

export default function Base($$renderer, $$props) {
	$$renderer.push(`<div class="svelte-1vmm665"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}