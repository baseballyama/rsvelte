import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input value="1"/> <input/> <input/> <input/> <input type="number" min="0"/> <div tabindex="1"></div> <div></div> <div></div> <div></div> <div></div> <!> <!> <!> <div></div> <!>`, 1);

export default function Input_1($$anchor) {
	var fragment = root();
	var input = $.first_child(fragment);
	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.set_value(input_1, 1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	$.set_value(input_2, value);

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	$.set_value(input_3, 1);

	var div = $.sibling(input_3, 6);

	$.set_attribute(div, 'tabindex', 1);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'tabindex', tabindex);

	var div_2 = $.sibling(div_1, 2);

	$.set_attribute(div_2, 'tabindex', tabindex);

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'tabindex', 1);

	var node = $.sibling(div_3, 2);

	Input(node, { value: '1' });

	var node_1 = $.sibling(node, 2);

	Input(node_1, { value: 1 });

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, { value });

	var div_4 = $.sibling(node_2, 2);

	$.set_attribute(div_4, 'title', 'Really?\n    Yes');

	var node_3 = $.sibling(div_4, 2);

	Input(node_3, { hi_hi: false, 'hi-hi': '' });
	$.append($$anchor, fragment);
}