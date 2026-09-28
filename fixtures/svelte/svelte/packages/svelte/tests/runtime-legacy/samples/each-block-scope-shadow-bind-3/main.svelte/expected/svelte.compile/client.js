import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> <input/> <input/></div>`);

export default function Main($$anchor) {
	let a = [['Hello', 'World'], ['Sapper', 'App']];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => a, $.index, ($$anchor, a, $$index, $$array) => {
		var div = root();
		var text = $.child(div);
		var input = $.sibling(text);

		$.remove_input_defaults(input);

		var input_1 = $.sibling(input, 2);

		$.remove_input_defaults(input_1);
		$.reset(div);
		$.template_effect(() => $.set_text(text, `${$.get(a)[0] ?? ''} ${$.get(a)[1] ?? ''} `));
		$.bind_value(input, () => $.get(a)[0], ($$value) => ($.get(a)[0] = $$value));
		$.bind_value(input_1, () => $.get(a)[1], ($$value) => ($.get(a)[1] = $$value));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}