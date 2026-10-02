import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <input/>`, 1);

export default function Bind_on_test01_input($$anchor) {
	/* eslint no-console: 0 -- test */
	let value = 'Hello World';

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	$.event('input', input, () => console.log('Old value:', value));
	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.event('input', input, () => console.log('New value:', value));
	$.event('input', input_1, () => console.log('Old value:', value));
	$.bind_value(input_1, () => value, ($$value) => value = $$value);
	$.bind_value(input_2, () => value, ($$value) => value = $$value);
	$.event('input', input_2, () => console.log('New value:', value));
	$.append($$anchor, fragment);
}