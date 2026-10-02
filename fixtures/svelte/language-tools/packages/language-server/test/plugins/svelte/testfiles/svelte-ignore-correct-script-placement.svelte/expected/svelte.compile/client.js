import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p></p>`, 1);

export default function Svelte_ignore_correct_script_placement($$anchor) {
	let a = 1;
	let b = $.proxy(a);
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}