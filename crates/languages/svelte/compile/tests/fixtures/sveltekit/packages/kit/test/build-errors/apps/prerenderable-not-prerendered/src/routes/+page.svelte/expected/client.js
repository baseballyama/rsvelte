import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo">this page is not prerendered, so this link is not crawled</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}