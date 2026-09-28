import * as $ from 'svelte/internal/server';

export default function Span($$renderer, $$props) {
	$$renderer.push(`<span><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></span>`);
}