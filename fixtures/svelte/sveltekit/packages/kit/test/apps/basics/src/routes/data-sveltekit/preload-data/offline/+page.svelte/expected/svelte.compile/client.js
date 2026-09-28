import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="one" href="/data-sveltekit/preload-data/offline/target" data-sveltekit-preload-data="">target</a> <a id="slow-navigation" href="/data-sveltekit/preload-data/offline/slow-navigation" data-sveltekit-preload-data="">slow-navigation</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}