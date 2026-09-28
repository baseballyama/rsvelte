import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/shadowed/same-render?param1=value1">Click here to navigate</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}