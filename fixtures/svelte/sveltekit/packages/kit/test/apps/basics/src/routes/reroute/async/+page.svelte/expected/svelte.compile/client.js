import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/reroute/async/a">Go to url that should be rewritten</a> <a href="/reroute/async/c">Go to url that should be rewritten and its reroute api call prerendered</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}