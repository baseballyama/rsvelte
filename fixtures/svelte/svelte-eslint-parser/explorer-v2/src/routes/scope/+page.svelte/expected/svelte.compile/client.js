import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ScopeExplorer from '$lib/ScopeExplorer.svelte';

export default function _page($$anchor) {
	$.head('118gypg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'ScopeManager | svelte-eslint-parser';
		});
	});

	ScopeExplorer($$anchor, {});
}