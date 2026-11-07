import * as $ from 'svelte/internal/server';
import ScopeExplorer from '$lib/ScopeExplorer.svelte';

export default function _page($$renderer) {
	$.head('118gypg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>ScopeManager | svelte-eslint-parser</title>`);
		});
	});

	ScopeExplorer($$renderer, {});
}