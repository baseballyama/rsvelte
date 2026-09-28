import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	let value = '';
	var input = root();

	$.remove_input_defaults(input);

	$.bind_value(
		input,
		/** ( */
		() => value,
		(v) => value = v.toLowerCase()
	);

	$.append($$anchor, input);
}