import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input type="checkbox"/>`);
var root_1 = $.from_html(`<input type="checkbox"/> <input type="radio"/> <input type="radio"/> <input type="checkbox"/> <!> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/>`, 1);
export default function Bind_group_interpolated_value($$anchor, $$props) {
	const binding_group = [];
	const binding_group_1 = [];
	let group = $.state($.proxy([]));
	let one = $.state("");
	let checked = $.state(false);
	let items = $.proxy([1, 2]);
	let c = "q";
	function f(x) {
		return x;
	}
	var fragment = root_1();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_value;
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	var input_1_value;
	var input_2 = $.sibling(input_1, 2);
	$.remove_input_defaults(input_2);
	var input_2_value;
	var input_3 = $.sibling(input_2, 2);
	$.remove_input_defaults(input_3);
	var input_3_value;
	var node = $.sibling(input_3, 2);
	$.each(node, 17, () => items, $.index, ($$anchor, item, i) => {
		var input_4 = root();
		$.remove_input_defaults(input_4);
		var input_4_value;
		$.template_effect(() => {
			if (input_4_value !== (input_4_value = `${$.get(item) ?? ""}-${i}-${$$props.p ?? ""}`)) {
				input_4.value = input_4.__value = input_4_value;
			}
		});
		$.bind_group(binding_group, [], input_4, () => {
			`${$.get(item) ?? ""}-${i}-${$$props.p ?? ""}`;
			return $.get(group);
		}, ($$value) => $.set(group, $$value));
		$.append($$anchor, input_4);
	});
	var input_5 = $.sibling(node, 2);
	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = "aq";
	var input_6 = $.sibling(input_5, 2);
	$.remove_input_defaults(input_6);
	input_6.value = input_6.__value = "it's q";
	var input_7 = $.sibling(input_6, 2);
	$.remove_input_defaults(input_7);
	input_7.value = input_7.__value = "say \"q\" \\ back";
	var input_8 = $.sibling(input_7, 2);
	$.remove_input_defaults(input_8);
	input_8.value = input_8.__value = "lit";
	$.template_effect(($0, $1) => {
		if (input_value !== (input_value = `${$$props.p ?? ""}-${$$props.q ?? ""}`)) {
			input.value = input.__value = input_value;
		}
		if (input_1_value !== (input_1_value = `x${$$props.p ?? ""}`)) {
			input_1.value = input_1.__value = input_1_value;
		}
		if (input_2_value !== (input_2_value = `${$0 ?? ""}${$$props.q ?? ""}`)) {
			input_2.value = input_2.__value = input_2_value;
		}
		if (input_3_value !== (input_3_value = `${$$props.p ?? ""}:${$1 ?? ""}`)) {
			input_3.value = input_3.__value = input_3_value;
		}
	}, [() => f($$props.p), () => f($$props.q)]);
	$.bind_group(binding_group, [], input, () => {
		`${$$props.p ?? ""}-${$$props.q ?? ""}`;
		return $.get(group);
	}, ($$value) => $.set(group, $$value));
	$.bind_group(binding_group_1, [], input_1, () => {
		`x${$$props.p ?? ""}`;
		return $.get(one);
	}, ($$value) => $.set(one, $$value));
	$.bind_group(binding_group_1, [], input_2, () => {
		`${f($$props.p) ?? ""}${$$props.q ?? ""}`;
		return $.get(one);
	}, ($$value) => $.set(one, $$value));
	$.bind_checked(input_3, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.bind_group(binding_group, [], input_5, () => {
		"aq";
		return $.get(group);
	}, ($$value) => $.set(group, $$value));
	$.bind_group(binding_group, [], input_6, () => {
		"it\'s q";
		return $.get(group);
	}, ($$value) => $.set(group, $$value));
	$.bind_group(binding_group, [], input_7, () => {
		'say "q" \\ back';
		return $.get(group);
	}, ($$value) => $.set(group, $$value));
	$.bind_group(binding_group, [], input_8, () => {
		"lit";
		return $.get(group);
	}, ($$value) => $.set(group, $$value));
	$.append($$anchor, fragment);
}
