import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Main($$anchor) {
	let text = $.state('A');
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_1, $.get(text)));
	$.bind_value(input, () => $.get(text), (v) => $.set(text, v.toUpperCase(), true));
	$.append($$anchor, fragment);
}