import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./Inner.svelte";

var root = $.from_html(`<input/> <!>`, 1);

export default function Main($$anchor) {
	let value = '';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	Inner(node, {
		get value() {
			return value;
		}
	});

	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
}