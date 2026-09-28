import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <br/>`, 1);

export default function Input($$anchor) {
	let objArray = [[1, 2, 3, "4"], [5, 6, 7, "8"]];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => objArray, ([id, ...rest]) => id, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item)));
		let id = () => $.get($$array)[0];
		let rest = () => $.get($$array).slice(1);
		var fragment_1 = root();
		var input = $.first_child(fragment_1);

		$.remove_input_defaults(input);
		$.next(2);
		$.template_effect(() => $.set_attribute(input, 'placeholder', rest()[2]));
		$.bind_value(input, () => rest()[0], ($$value) => (rest()[0] = $$value));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}