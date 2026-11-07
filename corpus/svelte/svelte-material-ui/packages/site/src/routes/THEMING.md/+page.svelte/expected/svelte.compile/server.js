import * as $ from 'svelte/internal/server';
import Theming from '../../../../../THEMING.md';

export default function _page($$renderer) {
	$.head('17ool58', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Theming - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-17ool58">`);
	Theming($$renderer, {});
	$$renderer.push(`<!----></section>`);
}