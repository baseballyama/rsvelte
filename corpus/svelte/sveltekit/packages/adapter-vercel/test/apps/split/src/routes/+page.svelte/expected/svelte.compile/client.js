import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello from SvelteKit on Vercel</h1> <nav><a href="/a">go to route a</a></nav>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}