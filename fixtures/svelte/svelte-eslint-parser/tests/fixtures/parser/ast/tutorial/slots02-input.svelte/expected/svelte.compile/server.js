import * as $ from 'svelte/internal/server';

export default function Slots02_input($$renderer, $$props) {
	$$renderer.push(`<div class="box svelte-ff8cx1"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}