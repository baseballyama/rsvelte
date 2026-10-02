import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> `, 1);

export default function Output($$anchor) {
	let name = $.state('world');
	let upper = $.derived(() => $.get(name).toUpperCase());
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var text = $.sibling(input_1);

	$.template_effect(() => $.set_text(text, ` ${$.get(upper) ?? ''}`));
	$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
	$.bind_value(input_1, () => $.get(upper), ($$value) => $.set(upper, $$value));
	$.append($$anchor, fragment);
}