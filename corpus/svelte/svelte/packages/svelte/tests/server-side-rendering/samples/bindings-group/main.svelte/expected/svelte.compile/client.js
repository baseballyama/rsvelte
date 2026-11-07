import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <input type="radio"/> <input type="radio"/> <input type="checkbox"/> <input type="checkbox"/>`, 1);

export default function Main($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	let tortilla = 'Plain';
	let fillings = ['Cheese'];
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var input = $.sibling(div, 2);

	$.remove_input_defaults(input);
	input.value = input.__value = 'Plain';

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'Whole wheat';

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'Beans';

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'Cheese';
	$.template_effect(($0) => $.set_text(text, $0), [() => fillings.toString()]);
	$.bind_group(binding_group, [], input, () => tortilla, ($$value) => tortilla = $$value);
	$.bind_group(binding_group, [], input_1, () => tortilla, ($$value) => tortilla = $$value);
	$.bind_group(binding_group_1, [], input_2, () => fillings, ($$value) => fillings = $$value);
	$.bind_group(binding_group_1, [], input_3, () => fillings, ($$value) => fillings = $$value);
	$.append($$anchor, fragment);
}