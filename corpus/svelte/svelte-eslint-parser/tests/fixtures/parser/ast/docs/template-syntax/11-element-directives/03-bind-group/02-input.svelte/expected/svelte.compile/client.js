import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="radio"/> <input type="radio"/> <input type="radio"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/>`, 1);

export default function _2_input($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	let tortilla = 'Plain';
	let fillings = [];
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	input.value = input.__value = 'Plain';

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'Whole wheat';

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'Spinach';

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'Rice';

	var input_4 = $.sibling(input_3, 2);

	$.remove_input_defaults(input_4);
	input_4.value = input_4.__value = 'Beans';

	var input_5 = $.sibling(input_4, 2);

	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = 'Cheese';

	var input_6 = $.sibling(input_5, 2);

	$.remove_input_defaults(input_6);
	input_6.value = input_6.__value = 'Guac (extra)';
	$.bind_group(binding_group, [], input, () => tortilla, ($$value) => tortilla = $$value);
	$.bind_group(binding_group, [], input_1, () => tortilla, ($$value) => tortilla = $$value);
	$.bind_group(binding_group, [], input_2, () => tortilla, ($$value) => tortilla = $$value);
	$.bind_group(binding_group_1, [], input_3, () => fillings, ($$value) => fillings = $$value);
	$.bind_group(binding_group_1, [], input_4, () => fillings, ($$value) => fillings = $$value);
	$.bind_group(binding_group_1, [], input_5, () => fillings, ($$value) => fillings = $$value);
	$.bind_group(binding_group_1, [], input_6, () => fillings, ($$value) => fillings = $$value);
	$.append($$anchor, fragment);
}