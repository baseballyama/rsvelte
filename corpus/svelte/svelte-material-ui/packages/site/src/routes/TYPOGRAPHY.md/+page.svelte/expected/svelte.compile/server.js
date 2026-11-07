import * as $ from 'svelte/internal/server';
import Typography from '../../../../../TYPOGRAPHY.md';

export default function _page($$renderer) {
	$.head('1m19mmx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Typography - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-1m19mmx">`);
	Typography($$renderer, {});
	$$renderer.push(`<!----></section>`);
}