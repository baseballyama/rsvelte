import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let item = $.prop($$props, 'item', 7);
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => item().heading, ($$value) => item().heading = $$value);
	$.append($$anchor, input);
	$.pop();
}