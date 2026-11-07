import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <!>`, 1);

export default function Input_1($$anchor) {
	let value;
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	Input(node, {
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
}