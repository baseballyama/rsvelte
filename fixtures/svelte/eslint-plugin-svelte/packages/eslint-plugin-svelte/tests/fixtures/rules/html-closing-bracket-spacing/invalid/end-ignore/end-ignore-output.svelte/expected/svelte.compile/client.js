import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p> <p>Hi</p> <div></div>`, 1);

export default function End_ignore_output($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}