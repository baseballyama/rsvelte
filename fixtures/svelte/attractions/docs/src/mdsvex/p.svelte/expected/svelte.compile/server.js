import * as $ from 'svelte/internal/server';

export default function P($$renderer, $$props) {
	$$renderer.push(`<p><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></p>`);
}