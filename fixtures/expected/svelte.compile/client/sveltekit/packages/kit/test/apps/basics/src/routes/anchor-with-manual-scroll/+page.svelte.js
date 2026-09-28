import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Welcome to a test project</h1> <a href="/anchor-with-manual-scroll/anchor-onmount#go-to-element" class="svelte-mhookp">Anchor demo</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}