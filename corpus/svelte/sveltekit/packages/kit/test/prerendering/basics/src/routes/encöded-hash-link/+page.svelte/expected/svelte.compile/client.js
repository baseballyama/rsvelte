import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 id="encöded"><a href="#encöded">encöded</a></h2>`);

export default function _page($$anchor) {
	var h2 = root();

	$.append($$anchor, h2);
}