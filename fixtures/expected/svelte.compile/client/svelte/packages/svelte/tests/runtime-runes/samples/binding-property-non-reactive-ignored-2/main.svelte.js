import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	let arr = [];
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => arr[0], ($$value) => arr[0] = $$value);
	$.append($$anchor, input);
}