import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://svelte.dev">Hello</a> <span style="font-weight: bold;">World!</span>`, 1);

export default function No_style01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}