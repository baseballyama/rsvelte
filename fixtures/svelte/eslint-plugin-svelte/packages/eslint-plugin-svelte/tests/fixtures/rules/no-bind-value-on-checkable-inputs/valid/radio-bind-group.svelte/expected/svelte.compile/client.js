import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="radio"/> <input type="radio"/> <input type="radio"/> `, 1);

export default function Radio_bind_group($$anchor) {
	const binding_group = [];
	let selection = $.state('cat');
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	input.value = input.__value = 'cat';

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'dog';

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'fish';

	var text = $.sibling(input_2);

	$.template_effect(() => $.set_text(text, ` ${$.get(selection) ?? ''}`));
	$.bind_group(binding_group, [], input, () => $.get(selection), ($$value) => $.set(selection, $$value));
	$.bind_group(binding_group, [], input_1, () => $.get(selection), ($$value) => $.set(selection, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(selection), ($$value) => $.set(selection, $$value));
	$.append($$anchor, fragment);
}