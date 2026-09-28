import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="#example" data-sveltekit-reload="">focus</a> <input id="example"/> <a href="/data-sveltekit/reload/hash/new">new page</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}