import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Main($$anchor) {
	let array = $.state($.proxy([{ value: 'a' }]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(array), $.index, ($$anchor, obj) => {
		var fragment_1 = root();
		var input = $.first_child(fragment_1);

		$.remove_input_defaults(input);

		var p = $.sibling(input, 2);
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(obj).value));
		$.bind_value(input, () => $.get(obj).value, (value) => $.set(array, [{ value }], true));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}