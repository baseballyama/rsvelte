import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	let name;
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => name, ($$value) => name = $$value);
	$.append($$anchor, input);
}