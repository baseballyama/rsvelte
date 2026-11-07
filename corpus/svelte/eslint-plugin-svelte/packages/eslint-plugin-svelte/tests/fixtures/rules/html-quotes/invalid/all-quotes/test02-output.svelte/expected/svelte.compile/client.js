import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/>`);

export default function Test02_output($$anchor) {
	let text = '';
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => text, ($$value) => text = $$value);
	$.append($$anchor, input);
}