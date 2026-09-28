import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Should have been rewritten to <code>/reroute/basic/b</code></h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}