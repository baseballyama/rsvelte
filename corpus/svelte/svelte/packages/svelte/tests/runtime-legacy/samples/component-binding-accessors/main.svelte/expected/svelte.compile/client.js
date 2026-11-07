import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<!> <input/> <button>Reset</button>`, 1);

export default function Main($$anchor) {
	let value = 'something';
	let c;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		Nested(node, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
			}
		}),
		($$value) => c = $$value,
		() => c
	);

	var input = $.sibling(node, 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.bind_value(input, () => value, ($$value) => value = $$value);

	$.event('click', button, () => {
		c.value = 'Reset';
	});

	$.append($$anchor, fragment);
}