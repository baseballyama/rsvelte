import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Dynamic_type($$anchor) {
	let isChecked = $.state(false);
	let type = 'checkbox';
	var input = root();

	$.remove_input_defaults(input);
	$.set_attribute(input, 'type', type);
	$.bind_value(input, () => $.get(isChecked), ($$value) => $.set(isChecked, $$value));
	$.append($$anchor, input);
}