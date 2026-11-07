import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<div class="modal"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}