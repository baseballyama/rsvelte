import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>prerendering: __INITIAL_PRERENDERING__/__PRERENDERING__</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}