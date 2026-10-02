import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <h1></h1>`, 1);

export default function Text_inputs02_input($$anchor) {
	let name = 'world';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	$.set_value(input, name);

	var h1 = $.sibling(input, 2);

	h1.textContent = 'Hello world!';
	$.append($$anchor, fragment);
}