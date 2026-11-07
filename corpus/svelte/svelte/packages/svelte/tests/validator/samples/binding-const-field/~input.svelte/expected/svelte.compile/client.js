import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	const dummy = { foo: 'bar' };
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => dummy.foo, ($$value) => dummy.foo = $$value);
	$.append($$anchor, input);
}