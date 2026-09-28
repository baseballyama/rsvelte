import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/reroute/basic/a">Go to url that should be rewritten</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}