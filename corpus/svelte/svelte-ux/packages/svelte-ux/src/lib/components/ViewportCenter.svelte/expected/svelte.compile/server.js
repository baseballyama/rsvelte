import * as $ from 'svelte/internal/server';

export default function ViewportCenter($$renderer, $$props) {
	$$renderer.push(`<div class="ViewportCenter fixed top-0 left-0 h-screen w-screen flex flex-col items-center justify-center"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}