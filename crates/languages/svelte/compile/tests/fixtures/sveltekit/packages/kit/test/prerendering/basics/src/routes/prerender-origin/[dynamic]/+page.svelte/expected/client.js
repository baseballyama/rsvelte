import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>This page will only be discovered if full hrefs that start with config.prerender.origin are
	crawled</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}