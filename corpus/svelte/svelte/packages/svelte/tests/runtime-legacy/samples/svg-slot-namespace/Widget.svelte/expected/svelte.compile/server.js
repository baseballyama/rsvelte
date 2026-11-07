import * as $ from 'svelte/internal/server';

export default function Widget($$renderer, $$props) {
	$$renderer.push(`<svg><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></svg>`);
}