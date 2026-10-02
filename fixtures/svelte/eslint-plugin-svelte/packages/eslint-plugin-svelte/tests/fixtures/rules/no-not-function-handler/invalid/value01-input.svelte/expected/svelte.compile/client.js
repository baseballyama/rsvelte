import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button> <button></button>`, 1);

export default function Value01_input($$anchor) {
	const a = 42;
	const b = 42n;
	const c = /reg/;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.event('click', button, a);
	$.event('click', button_1, b);
	$.event('click', button_2, c);
	$.append($$anchor, fragment);
}