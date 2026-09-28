import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="number"/>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15);
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, value);
	$.append($$anchor, input);
	$.pop();
}