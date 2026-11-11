import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input type="checkbox"/>`);
var root_1 = $.from_html(`<!> <input type="checkbox"/>`, 1);
export default function Bind_group_destructured($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	let list = $.proxy([{
		id: 1,
		data: [{ data: [] }]
	}]);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => list, $.index, ($$anchor, $$item, $$index_1) => {
		let id = () => $.get($$item).id;
		let data = () => $.get($$item).data;
		const picks = $.derived(() => data()[0]);
		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);
		$.each(node_1, 17, data, $.index, ($$anchor, item, $$index) => {
			var input = root();
			$.remove_input_defaults(input);
			var input_value;
			$.template_effect(() => {
				if (input_value !== (input_value = id())) {
					input.value = (input.__value = input_value) ?? "";
				}
			});
			$.bind_group(binding_group, [$$index, $$index_1], input, () => {
				id();
				return $.get(item).data;
			}, ($$value) => $.get(item).data = $$value);
			$.append($$anchor, input);
		});
		var input_1 = $.sibling(node_1, 2);
		$.remove_input_defaults(input_1);
		var input_1_value;
		$.template_effect(() => {
			if (input_1_value !== (input_1_value = id())) {
				input_1.value = (input_1.__value = input_1_value) ?? "";
			}
		});
		$.bind_group(binding_group_1, [$$index_1], input_1, () => {
			id();
			return $.get(picks).data;
		}, ($$value) => $.get(picks).data = $$value);
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
}
