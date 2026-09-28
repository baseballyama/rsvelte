import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/shadowed/redirect/a">redirect to c</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}