import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'inner', { text: 'hello world' }, null);
	$$renderer.push(`<!--]-->`);
}