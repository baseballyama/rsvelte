import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<div class="inner"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}