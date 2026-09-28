import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Output($$anchor) {
	let state = 'world';
	let other;
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => other, ($$value) => other = $$value);
	$.append($$anchor, input);
}