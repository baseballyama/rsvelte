import * as $ from 'svelte/internal/server';

export default function Link($$renderer, $$props) {
	$$renderer.push(`<p><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></p>`);
}