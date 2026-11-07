import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h3>navigation test start</h3>`);

export default function _page($$anchor) {
	var h3 = root();

	$.append($$anchor, h3);
}