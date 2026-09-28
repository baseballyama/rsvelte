import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'foo-bar', {}, null);
	$$renderer.push(`<!--]--></div>`);
}