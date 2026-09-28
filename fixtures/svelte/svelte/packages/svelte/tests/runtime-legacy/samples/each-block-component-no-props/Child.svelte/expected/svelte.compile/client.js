import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hello</p>`);

export default function Child($$anchor) {
	var p = root();

	$.append($$anchor, p);
}