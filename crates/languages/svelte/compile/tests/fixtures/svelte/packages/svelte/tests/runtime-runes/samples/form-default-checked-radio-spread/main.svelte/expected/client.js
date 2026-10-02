import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><input/> <input type="radio" name="option" value="b"/> <input type="reset" value="Reset"/></form>`);

export default function Main($$anchor) {
	let spread = { defaultChecked: true, checked: true };
	var form = root();
	var input = $.child(form);

	$.attribute_effect(input, () => ({ type: 'radio', name: 'option', value: 'a', ...spread }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);
	var input_2 = $.sibling(input_1, 2);

	$.reset(form);
	$.append($$anchor, form);
}