import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'test', {}, null);
	$$renderer.push(`<!--]--></div>`);
}