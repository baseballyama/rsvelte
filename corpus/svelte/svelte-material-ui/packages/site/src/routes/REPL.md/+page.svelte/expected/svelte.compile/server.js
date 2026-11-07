import * as $ from 'svelte/internal/server';
import Repl from '../../../../../REPL.md';

export default function _page($$renderer) {
	$.head('1duy9x5', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>REPL - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="markdown svelte-1duy9x5">`);
	Repl($$renderer, {});
	$$renderer.push(`<!----></section>`);
}