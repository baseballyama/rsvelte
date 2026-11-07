import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>before</p> <p>after</p>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}