import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="range"/> <input type="range"/> <p> </p>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var p = $.sibling(input_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} * 2 = ${$.get(double) ?? ''}`));
	$.bind_value(input, () => $.get(count), ($$value) => $.set(count, $$value));
	$.bind_value(input_1, () => $.get(double), ($$value) => $.set(double, $$value));
	$.append($$anchor, fragment);
}