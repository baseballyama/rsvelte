import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>...</button> <button>...</button>`, 1);

export default function Test01_input($$anchor) {
	let disabled = false;
	var fragment = root();
	var button = $.first_child(fragment);

	button.disabled = disabled;

	var button_1 = $.sibling(button, 2);

	button_1.disabled = disabled;
	$.append($$anchor, fragment);
}