import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p id="redirected">redirected</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}