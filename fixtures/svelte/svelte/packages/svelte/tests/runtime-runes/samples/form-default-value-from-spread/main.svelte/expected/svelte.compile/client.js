import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <input/>`, 1);

export default function Main($$anchor) {
	let text = { defaultValue: "a" };
	let checkbox = { defaultChecked: true };
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ ...text }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ type: 'checkbox', ...checkbox }), void 0, void 0, void 0, void 0, true);

	var input_2 = $.sibling(input_1, 2);

	$.attribute_effect(input_2, () => ({ value: 'b', ...text }), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, fragment);
}