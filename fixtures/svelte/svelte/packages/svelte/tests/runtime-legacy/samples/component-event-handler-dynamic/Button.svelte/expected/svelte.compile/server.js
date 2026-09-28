import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	$$renderer.push(`<button><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button>`);
}