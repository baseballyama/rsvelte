import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1> <h1>Hello</h1> <h1>Hello</h1>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var h1 = $.first_child(fragment);

	$.action(h1, ($$node, $$action_arg) => blink?.($$node, $$action_arg), () => (500, 2));

	var h1_1 = $.sibling(h1, 2);

	$.action(h1_1, ($$node, $$action_arg) => blink?.($$node, $$action_arg), () => (500, 2));

	var h1_2 = $.sibling(h1_1, 2);

	$.action(h1_2, ($$node, $$action_arg) => blink?.($$node, $$action_arg), () => (500, 2));
	$.append($$anchor, fragment);
}