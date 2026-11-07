import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1> <h1>Hello</h1> <h1>Hello</h1>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var h1 = $.first_child(fragment);
	var h1_1 = $.sibling(h1, 2);
	var h1_2 = $.sibling(h1_1, 2);

	$.transition(3, h1, () => blink);
	$.transition(1, h1_1, () => blink);
	$.transition(2, h1_2, () => blink);
	$.append($$anchor, fragment);
}