import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`before <h1>after</h1>`, 1);

export default function Main($$anchor) {
	$.next();

	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}