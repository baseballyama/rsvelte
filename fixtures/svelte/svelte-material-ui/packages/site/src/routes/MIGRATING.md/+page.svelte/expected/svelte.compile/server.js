import * as $ from 'svelte/internal/server';
import Migrating from '../../../../../MIGRATING.md';

export default function _page($$renderer) {
	$.head('bimf98', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Migrating - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-bimf98">`);
	Migrating($$renderer, {});
	$$renderer.push(`<!----></section>`);
}