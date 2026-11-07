import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Test for characters that need to be en/decoded during prerendering</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}