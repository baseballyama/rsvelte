import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/optional-params/with-value">Path with Value</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}