import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a data-sveltekit-preload-data="" href="/path-base/preloading/preloaded">click me</a> <a data-sveltekit-preload-code="" href="/path-base/preloading/code">click me 2</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}