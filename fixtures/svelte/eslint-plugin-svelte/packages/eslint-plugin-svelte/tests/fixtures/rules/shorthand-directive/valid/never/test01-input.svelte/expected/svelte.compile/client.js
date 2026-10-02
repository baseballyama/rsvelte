import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <div>...</div> <div>...</div>`, 1);

export default function Test01_input($$anchor) {
	let value = 'hello!';
	let active = true;
	let color = 'red';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var div = $.sibling(input, 2);

	$.set_class(div, 1, '', null, {}, { active });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color });
	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
}