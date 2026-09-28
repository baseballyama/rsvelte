import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/env';

var root = $.from_html(
	`<p>The sole purpose of this page is to apply a \`window.fetch\` patch before navigating to the next
	page. Click the link below to navigate to the next page with a server load function.</p> <a href="./patching-server-load-ii">Go To Page with Server Load</a>`,
	1
);

export default function _page($$anchor) {
	if (browser) {
		const original_fetch = window.fetch;

		window.fetch = (input, init) => {
			console.log('Called a patched window.fetch for server load request');

			return original_fetch(input, init);
		};
	}

	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}