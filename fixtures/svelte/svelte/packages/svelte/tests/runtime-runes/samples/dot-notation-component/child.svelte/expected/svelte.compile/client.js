import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello</h1>`);

export default function Child($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}