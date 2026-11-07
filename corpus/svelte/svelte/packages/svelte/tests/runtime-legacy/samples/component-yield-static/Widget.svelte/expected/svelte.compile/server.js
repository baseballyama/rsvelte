import * as $ from 'svelte/internal/server';

export default function Widget($$renderer, $$props) {
	$$renderer.push(`<b><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></b>`);
}