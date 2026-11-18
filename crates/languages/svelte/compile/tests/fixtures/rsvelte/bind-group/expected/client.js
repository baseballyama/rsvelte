import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<input type="checkbox"/>`);
var root_1 = $.from_html(`<input type="checkbox"/> <!>`, 1);
var root_2 = $.from_html(`<input type="radio"/>`);
var root_3 = $.from_html(`<input type="checkbox"/> <input type="checkbox"/> <input type="radio"/> <input type="radio"/> <!> <!> <!>`, 1);
export default function Bind_group($$anchor) {
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];
	const binding_group_4 = [];
	const binding_group_5 = [];
	let selected = $.state($.proxy([]));
	let one = $.state("a");
	let v = "x";
	let items = $.proxy([{ picks: [] }]);
	let binding_group = 1;
	var fragment = root_3();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	input.value = input.__value = "a";
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = v;
	var input_2 = $.sibling(input_1, 2);
	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = "b";
	var input_3 = $.sibling(input_2, 2);
	$.remove_input_defaults(input_3);
	var node = $.sibling(input_3, 2);
	$.each(node, 17, () => items, $.index, ($$anchor, item, $$index_1) => {
		let i = $$index_1;
		var fragment_1 = root_1();
		var input_4 = $.first_child(fragment_1);
		$.remove_input_defaults(input_4);
		input_4.value = input_4.__value = "p";
		var node_1 = $.sibling(input_4, 2);
		$.each(node_1, 16, () => [1, 2], (n) => n, ($$anchor, n) => {
			var input_5 = root();
			$.remove_input_defaults(input_5);
			var input_5_value;
			$.template_effect(() => {
				if (input_5_value !== (input_5_value = n)) {
					input_5.value = (input_5.__value = input_5_value) ?? "";
				}
			});
			$.bind_group(binding_group_4, [$$index_1], input_5, () => {
				n;
				return items[i].picks;
			}, ($$value) => items[i].picks = $$value);
			$.append($$anchor, input_5);
		});
		$.bind_group(binding_group_3, [$$index_1], input_4, () => $.get(item).picks, ($$value) => $.get(item).picks = $$value);
		$.append($$anchor, fragment_1);
	});
	var node_2 = $.sibling(node, 2);
	$.each(node_2, 18, () => items, (item) => item, ($$anchor, item, $$index_2) => {
		let j = $$index_2;
		var input_6 = root_2();
		$.remove_input_defaults(input_6);
		var input_6_value;
		$.template_effect(() => {
			if (input_6_value !== (input_6_value = $.get(j))) {
				input_6.value = (input_6.__value = input_6_value) ?? "";
			}
		});
		$.bind_group(binding_group_5, [$.get($$index_2)], input_6, () => {
			$.get(j);
			return item.picks;
		}, ($$value) => item.picks = $$value);
		$.append($$anchor, input_6);
	});
	var node_3 = $.sibling(node_2, 2);
	C(node_3, {
		get group() {
			return $.get(one);
		},
		set group($$value) {
			$.set(one, $$value, true);
		}
	});
	$.bind_group(binding_group_1, [], input, () => $.get(selected), ($$value) => $.set(selected, $$value));
	$.bind_group(binding_group_1, [], input_1, () => {
		v;
		return $.get(selected);
	}, ($$value) => $.set(selected, $$value));
	$.bind_group(binding_group_2, [], input_2, () => $.get(one), ($$value) => $.set(one, $$value));
	$.bind_group(binding_group_2, [], input_3, () => $.get(one), ($$value) => $.set(one, $$value));
	$.append($$anchor, fragment);
}
