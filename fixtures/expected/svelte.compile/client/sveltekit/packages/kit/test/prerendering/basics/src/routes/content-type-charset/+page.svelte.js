import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/content-type-charset/dynamic">Please crawl this</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}