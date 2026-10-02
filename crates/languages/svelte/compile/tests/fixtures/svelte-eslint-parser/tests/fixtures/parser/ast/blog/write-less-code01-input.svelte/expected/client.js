import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="number"/> <input type="number"/> <p> </p>`, 1);

export default function Write_less_code01_input($$anchor) {
	let a = 1;
	let b = 2;
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var p = $.sibling(input_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${a ?? ''} + ${b ?? ''} = ${a + b}`));
	$.bind_value(input, () => a, ($$value) => a = $$value);
	$.bind_value(input_1, () => b, ($$value) => b = $$value);
	$.append($$anchor, fragment);
}