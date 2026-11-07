import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <h1> </h1>`, 1);

export default function Text_inputs01_input($$anchor) {
	let name = 'world';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var h1 = $.sibling(input, 2);
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `Hello ${name ?? ''}!`));
	$.bind_value(input, () => name, ($$value) => name = $$value);
	$.append($$anchor, fragment);
}