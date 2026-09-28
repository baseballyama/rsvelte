import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>This should not render due to load error</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}