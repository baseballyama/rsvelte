import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Null01_input($$anchor) {
	let a = null;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, function (...$$args) {
		(null)?.apply(this, $$args);
	});

	$.event('click', button_1, a);
	$.append($$anchor, fragment);
}