import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Test01_output($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}