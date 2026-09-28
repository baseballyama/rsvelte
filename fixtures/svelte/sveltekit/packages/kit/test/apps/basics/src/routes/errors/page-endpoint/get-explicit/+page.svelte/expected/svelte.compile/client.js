import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>if you see this something went wrong</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}