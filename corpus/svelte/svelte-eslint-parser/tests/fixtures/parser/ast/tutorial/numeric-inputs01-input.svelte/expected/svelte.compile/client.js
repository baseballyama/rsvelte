import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input type="number" min="0" max="10"/> <input type="range" min="0" max="10"/></label> <label><input type="number" min="0" max="10"/> <input type="range" min="0" max="10"/></label> <p></p>`, 1);

export default function Numeric_inputs01_input($$anchor) {
	let a = 1;
	let b = 2;
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.set_value(input, a);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.set_value(input_1, a);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_2 = $.child(label_1);

	$.remove_input_defaults(input_2);
	$.set_value(input_2, b);

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	$.set_value(input_3, b);
	$.reset(label_1);

	var p = $.sibling(label_1, 2);

	p.textContent = '1 + 2 = 3';
	$.append($$anchor, fragment);
}