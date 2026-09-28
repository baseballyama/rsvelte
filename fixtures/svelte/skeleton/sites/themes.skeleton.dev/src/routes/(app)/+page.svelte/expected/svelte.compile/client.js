import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="card preset-tonal-warning p-4 text-center"><p>Future home of the <u>browse</u> page.</p></div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}