import * as $ from 'svelte/internal/server';
import SvelteKit from '../../../../../SVELTEKIT.md';

export default function _page($$renderer) {
	$.head('1axy85z', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>SvelteKit - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-1axy85z">`);
	SvelteKit($$renderer, {});
	$$renderer.push(`<!----></section>`);
}