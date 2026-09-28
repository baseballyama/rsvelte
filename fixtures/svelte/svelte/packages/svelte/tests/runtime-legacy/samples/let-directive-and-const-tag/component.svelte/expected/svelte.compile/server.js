import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { data: 'foo' }, null);
	$$renderer.push(`<!--]-->`);
}