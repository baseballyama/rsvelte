import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="number"/>`);

export default function Html_comments01_input($$anchor) {
	let a = '';
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => a, ($$value) => a = $$value);
	$.append($$anchor, input);
}