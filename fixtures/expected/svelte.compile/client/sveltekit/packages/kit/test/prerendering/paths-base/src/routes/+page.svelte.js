import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><h1>Main Page</h1> <a href="nested">Nested Link</a></div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}