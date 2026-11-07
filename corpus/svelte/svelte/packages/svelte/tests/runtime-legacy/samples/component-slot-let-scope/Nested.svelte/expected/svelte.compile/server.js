import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'thing', { thing: 2 }, null);
	$$renderer.push(`<!--]-->`);
}