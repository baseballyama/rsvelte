import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 id="hash-target">a</h1> <a href="#hash-target">hash link</a> <a href="/routing/hashes/b">b</a> <a href="#replace-state" data-sveltekit-replacestate="">replace state</a> <a data-sveltekit-preload-data="" href="/routing/hashes/a">/routing/hashes/a</a> <a data-sveltekit-preload-data="" href="#preload">#preload</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(10);
	$.append($$anchor, fragment);
}