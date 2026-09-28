import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Welcome to a test project</h1> <a href="/use-action/focus-and-scroll" class="svelte-1boria6">Focus and scroll demo</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}