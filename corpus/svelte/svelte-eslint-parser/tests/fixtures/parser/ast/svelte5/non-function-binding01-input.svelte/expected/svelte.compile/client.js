import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Non_function_binding01_input($$anchor) {
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, x, y);
	$.append($$anchor, input);
}