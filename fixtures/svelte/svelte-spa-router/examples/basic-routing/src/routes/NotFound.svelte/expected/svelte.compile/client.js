import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2>NotFound</h2> <p>Oops, this route doesn't exist!</p>`, 1);

export default function NotFound($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}