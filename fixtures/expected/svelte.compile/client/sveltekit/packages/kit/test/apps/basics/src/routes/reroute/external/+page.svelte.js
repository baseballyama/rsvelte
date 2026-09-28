import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/reroute/external/rewritten">Go to rewritten page</a> <a href="https://expired.badssl.com/" data-test="external-url">External Link</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}