import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This route will be served by a different function because we use the split config</p>`);

export default function _page($$anchor) {
	var p = root();

	$.append($$anchor, p);
}