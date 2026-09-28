import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <br/>`, 1);

export default function Input($$anchor) {
	let objArray = [
		{ foo: '1', id: 0, innerValue: "test" },
		{ foo: '2', id: 1, innerValue: "Somethin" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => objArray, ({ id, ...rest }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let rest = () => $.exclude_from_object($.get($$item), ['id']);
		var fragment_1 = root();
		var input = $.first_child(fragment_1);

		$.remove_input_defaults(input);
		$.next(2);
		$.template_effect(() => $.set_attribute(input, 'placeholder', rest().foo));
		$.bind_value(input, () => rest().innerValue, ($$value) => (rest().innerValue = $$value));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}