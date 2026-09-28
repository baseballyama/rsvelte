import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { value: 'Hi' }, null);
	$$renderer.push(`<!--]-->`);
}