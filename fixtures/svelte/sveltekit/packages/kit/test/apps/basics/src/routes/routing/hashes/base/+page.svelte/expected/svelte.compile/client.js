import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="navigate" href="/routing/hashes/base/a#x">navigate</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}