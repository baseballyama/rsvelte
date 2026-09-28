import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/routing/split-params/x-y-z">/routing/split-params/x-y-z</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}