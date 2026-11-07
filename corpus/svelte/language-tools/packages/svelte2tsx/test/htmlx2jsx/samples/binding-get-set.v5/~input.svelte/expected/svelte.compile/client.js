import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <div></div> <div></div> <!> <!>`, 1);

export default function Input_1($$anchor) {
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var div = $.sibling(input_1, 2);
	var div_1 = $.sibling(div, 2);
	var node = $.sibling(div_1, 2);
	var bind_get = get;
	var bind_set = set;

	Input(node, {
		get value() {
			return bind_get();
		},

		set value($$value) {
			bind_set($$value);
		}
	});

	var node_1 = $.sibling(node, 2);
	var bind_get_1 = () => v;
	var bind_set_1 = (new_v) => v = new_v;

	Input(node_1, {
		get value() {
			return bind_get_1();
		},

		set value($$value) {
			bind_set_1($$value);
		}
	});

	$.bind_value(input, get, set);
	$.bind_value(input_1, () => v, (new_v) => v = new_v);
	$.bind_element_size(div, 'clientWidth', set);
	$.bind_resize_observer(div_1, 'contentRect', set);
	$.append($$anchor, fragment);
}