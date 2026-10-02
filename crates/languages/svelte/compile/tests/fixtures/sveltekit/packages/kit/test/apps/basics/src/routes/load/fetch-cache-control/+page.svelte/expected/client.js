import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/load/fetch-cache-control/load-data">load-data</a> <a href="/load/fetch-cache-control/headers-diff">headers-diff</a> <a href="/load/fetch-cache-control/b64">b64</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}