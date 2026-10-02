import * as $ from 'svelte/internal/server';
import AstExplorer from '$lib/AstExplorer.svelte';

export default function _page($$renderer) {
	$.head('1r63b47', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>svelte-eslint-parser</title>`);
		});

		$$renderer.push(`<meta name="description" content="Svelte parser for ESLint"/>`);
	});

	AstExplorer($$renderer, {});
}