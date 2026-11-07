import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div bar:foo=""></div>`, 1);

export default function Unknown_directive01_input($$anchor) {
	let foo = false;
	let bar = false;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_attribute(div, 'foo:bar', bar);
	$.next(2);
	$.append($$anchor, fragment);
}