import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input type="radio"/> <input/> <input type="checkbox"/>`, 1);
export default function Group_beside_checked($$anchor, $$props) {
	const binding_group = [];
	let g = $.state(void 0);
	let t = "a";
	var fragment = root();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	input.value = input.__value = t;
	var input_1 = $.sibling(input, 2);
	$.attribute_effect(input_1, () => ({
		type: "checkbox",
		value: t,
		checked: t === $.get(g),
		...$$props.p
	}), void 0, void 0, void 0, void 0, true);
	var input_2 = $.sibling(input_1, 2);
	$.remove_input_defaults(input_2);
	$.set_checked(input_2, true);
	$.template_effect(() => $.set_checked(input, t === $.get(g)));
	$.bind_group(binding_group, [], input, () => {
		t;
		return $.get(g);
	}, ($$value) => $.set(g, $$value));
	$.bind_group(binding_group, [], input_1, () => {
		t;
		return $.get(g);
	}, ($$value) => $.set(g, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(g), ($$value) => $.set(g, $$value));
	$.append($$anchor, fragment);
}
