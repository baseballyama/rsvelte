import * as $ from 'svelte/internal/server';

export default function Outer($$renderer, $$props) {
	$$renderer.push(`<div class="outer"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}