import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>The rewrite on this page should fail in the browser, causing a full navigation that resolves to <code>/reroute/error-handling/client-error-rewritten</code></h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}