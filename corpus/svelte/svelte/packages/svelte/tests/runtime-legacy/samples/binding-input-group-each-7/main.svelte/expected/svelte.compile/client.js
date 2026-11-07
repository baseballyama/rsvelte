import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/> <input type="checkbox"/> <input type="checkbox"/>`, 1);

export default function Main($$anchor) {
	const binding_group = [];

	const list = [
		{ id: 'x', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'y', data: [{ id: 1, data: [] }, { id: 2, data: [] }] },
		{ id: 'z', data: [{ id: 1, data: [] }, { id: 2, data: [] }] }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => list, $.index, ($$anchor, $$item, $$index_1) => {
		let id = () => $.get($$item).id;
		let data = () => $.get($$item).data;
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.each(node_1, 17, data, $.index, ($$anchor, item, $$index) => {
			var fragment_2 = root();
			var input = $.first_child(fragment_2);

			$.remove_input_defaults(input);
			input.value = input.__value = 'a';

			var input_1 = $.sibling(input, 2);

			$.remove_input_defaults(input_1);
			input_1.value = input_1.__value = 'b';

			var input_2 = $.sibling(input_1, 2);

			$.remove_input_defaults(input_2);
			input_2.value = input_2.__value = 'c';

			$.template_effect(() => {
				$.set_attribute(input, 'data-index', `${id() ?? ''}-${$.get(item).id ?? ''}`);
				$.set_attribute(input_1, 'data-index', `${id() ?? ''}-${$.get(item).id ?? ''}`);
				$.set_attribute(input_2, 'data-index', `${id() ?? ''}-${$.get(item).id ?? ''}`);
			});

			$.bind_group(binding_group, [$$index, $$index_1], input, () => $.get(item).data, ($$value) => ($.get(item).data = $$value));
			$.bind_group(binding_group, [$$index, $$index_1], input_1, () => $.get(item).data, ($$value) => ($.get(item).data = $$value));
			$.bind_group(binding_group, [$$index, $$index_1], input_2, () => $.get(item).data, ($$value) => ($.get(item).data = $$value));
			$.append($$anchor, fragment_2);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}