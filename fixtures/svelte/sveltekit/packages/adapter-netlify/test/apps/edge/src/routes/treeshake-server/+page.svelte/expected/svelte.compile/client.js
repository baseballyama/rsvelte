import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>this should never appear in the server bundle</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}