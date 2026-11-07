import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <input type="text"/>`, 1);

export default function Other_input_type($$anchor) {
	let text = $.state('');
	let value = $.state('');
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.bind_value(input_1, () => $.get(text), ($$value) => $.set(text, $$value));
	$.append($$anchor, fragment);
}