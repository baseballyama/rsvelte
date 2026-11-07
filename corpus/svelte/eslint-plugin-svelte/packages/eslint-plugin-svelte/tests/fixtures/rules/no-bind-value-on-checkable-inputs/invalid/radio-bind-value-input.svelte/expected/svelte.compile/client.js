import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="radio"/> <input type="radio"/> <input type="RADIO"/> <input/> <input/> <input type="radio"/>`, 1);

export default function Radio_bind_value_input($$anchor) {
	let check1 = $.state(true);
	let check2 = $.state(true);
	let check3 = $.state(true);
	let check4 = $.state(true);
	let value = $.state(true);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	$.set_attribute(input_3, 'type', 'radio');

	var input_4 = $.sibling(input_3, 2);

	$.remove_input_defaults(input_4);
	$.set_attribute(input_4, 'type', 'RADIO');

	var input_5 = $.sibling(input_4, 2);

	$.remove_input_defaults(input_5);
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.bind_value(input_1, () => $.get(check1), ($$value) => $.set(check1, $$value));
	$.bind_value(input_2, () => $.get(check2), ($$value) => $.set(check2, $$value));
	$.bind_value(input_3, () => $.get(check3), ($$value) => $.set(check3, $$value));
	$.bind_value(input_4, () => $.get(check4), ($$value) => $.set(check4, $$value));
	$.bind_value(input_5, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
}