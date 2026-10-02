import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="number"/> <input type="range" min="0" max="10"/> <p> </p>`, 1);

export default function Bind_number($$anchor) {
	let a = $.state(1);
	let b = $.state(2);
	let sum = $.derived(() => $.get(a) + $.get(b));
	var fragment = root();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var input_1 = $.sibling(input, 2);
	$.remove_input_defaults(input_1);
	var p = $.sibling(input_1, 2);
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} + ${$.get(b) ?? ''} = ${$.get(sum) ?? ''}`));
	$.bind_value(input, () => $.get(a), ($$value) => $.set(a, $$value));
	$.bind_value(input_1, () => $.get(b), ($$value) => $.set(b, $$value));
	$.append($$anchor, fragment);
}
