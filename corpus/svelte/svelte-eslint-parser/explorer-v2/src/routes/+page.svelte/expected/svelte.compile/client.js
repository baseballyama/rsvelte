import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AstExplorer from '$lib/AstExplorer.svelte';

var root = $.from_html(`<meta name="description" content="Svelte parser for ESLint"/>`);

export default function _page($$anchor) {
	$.head('1r63b47', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'svelte-eslint-parser';
		});

		$.append($$anchor, meta);
	});

	AstExplorer($$anchor, {});
}