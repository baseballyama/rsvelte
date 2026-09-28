import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>Hello</option><option>World</option></select> <input type="checkbox"/> <input type="checkbox"/>`, 1);

export default function Main($$anchor, $$props) {
	const binding_group = [];
	let value = $.state($.proxy(['Hello', 'World']));
	var fragment = root();
	var select = $.first_child(fragment);

	$.attribute_effect(select, () => ({ multiple: true, value: $.get(value), ...$$props.spread }));

	var input = $.sibling(select, 2);

	$.remove_input_defaults(input);
	input.value = input.__value = 'Hello';

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'World';
	$.bind_group(binding_group, [], input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
}