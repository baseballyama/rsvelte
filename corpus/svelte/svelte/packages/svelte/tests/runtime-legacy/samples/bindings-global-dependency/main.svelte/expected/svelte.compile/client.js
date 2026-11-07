import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/>`);

export default function Main($$anchor) {
	let data = { a: { value: '' } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => Object.values(data), $.index, ($$anchor, object, $$index) => {
		var input = root();

		$.remove_input_defaults(input);
		$.bind_value(input, () => $.get(object).value, ($$value) => ($.get(object).value = $$value));
		$.append($$anchor, input);
	});

	$.append($$anchor, fragment);
}