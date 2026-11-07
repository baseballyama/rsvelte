import * as $ from 'svelte/internal/server';
import Install from '../../../../../INSTALL.md';

export default function _page($$renderer) {
	$.head('1emavz5', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Installation - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-1emavz5">`);
	Install($$renderer, {});
	$$renderer.push(`<!----></section>`);
}