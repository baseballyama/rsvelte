import * as $ from 'svelte/internal/server';

export default function Widget($$renderer, $$props) {
	$$renderer.push(`<p class="widget"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></p>`);
}