import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Hello</p> <div></div> <div></div> <div></div>`, 1);

export default function Test_01_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}