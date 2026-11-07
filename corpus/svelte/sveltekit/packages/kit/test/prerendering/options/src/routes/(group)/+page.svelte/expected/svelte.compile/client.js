import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello</h1> <a href="/path-base/non-prerendered-page-and-endpoint/">page with a POST-only endpoint sibling</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}