import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <hr/> <input type="checkbox"/>a<br/> <input type="checkbox"/>b<br/> <input type="checkbox"/>c<br/> <input type="checkbox"/>d<br/> <hr/> <input type="checkbox"/>a<br/> <input type="checkbox"/>b<br/> <input type="checkbox"/>c<br/> <input type="checkbox"/>d<br/>`, 1);

export default function Main($$anchor) {
	const binding_group = [];
	let foo = [];
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var input = $.sibling(p, 4);

	$.remove_input_defaults(input);
	input.value = input.__value = 'a';

	var input_1 = $.sibling(input, 4);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'b';

	var input_2 = $.sibling(input_1, 4);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'c';

	var input_3 = $.sibling(input_2, 4);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'd';

	var input_4 = $.sibling(input_3, 6);

	$.remove_input_defaults(input_4);
	input_4.value = input_4.__value = 'a';

	var input_5 = $.sibling(input_4, 4);

	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = 'b';

	var input_6 = $.sibling(input_5, 4);

	$.remove_input_defaults(input_6);
	input_6.value = input_6.__value = 'c';

	var input_7 = $.sibling(input_6, 4);

	$.remove_input_defaults(input_7);
	input_7.value = input_7.__value = 'd';
	$.next(2);
	$.template_effect(() => $.set_text(text, `Checked: ${foo ?? ''}`));
	$.bind_group(binding_group, [], input, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_1, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_2, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_3, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_4, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_5, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_6, () => foo, ($$value) => foo = $$value);
	$.bind_group(binding_group, [], input_7, () => foo, ($$value) => foo = $$value);
	$.append($$anchor, fragment);
}