import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Welcome to SvelteKit</h1> <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}