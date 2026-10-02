import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function _1_input($$anchor) {
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => value, (v) => value = v.toLowerCase());
	$.append($$anchor, input);
}