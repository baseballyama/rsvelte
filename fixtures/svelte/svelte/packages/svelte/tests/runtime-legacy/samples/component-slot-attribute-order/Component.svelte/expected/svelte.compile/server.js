import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'footer', {}, null);
	$$renderer.push(`<!--]-->`);
}