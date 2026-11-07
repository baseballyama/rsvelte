import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>a</h1> <div style="height: 200vh; background: teal"></div> <a data-sveltekit-reload="" href="/scroll/cross-document/b">b</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}