import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <!>`, 1);

export default function Input($$anchor, $$props) {
	let val;
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	$.slot(
		node,
		$$props,
		'default',
		{
			get val() {
				return val;
			}
		},
		null
	);

	$.bind_value(input, () => val, ($$value) => val = $$value);
	$.append($$anchor, fragment);
}