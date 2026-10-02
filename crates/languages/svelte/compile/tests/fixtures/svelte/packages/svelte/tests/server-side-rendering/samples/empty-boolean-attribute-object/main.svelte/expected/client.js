import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <input/> <select multiple=""><option>A</option></select>`, 1);

export default function Main($$anchor) {
	const props = {};
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ disabled: '', ...props }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ hidden: '', ...props }), void 0, void 0, void 0, void 0, true);

	var input_2 = $.sibling(input_1, 2);

	$.attribute_effect(input_2, () => ({ disabled: false, ...props }), void 0, void 0, void 0, void 0, true);

	var select = $.sibling(input_2, 2);
	var option = $.child(select);

	option.value = option.__value = 'a';
	$.reset(select);
	select.value = select.__value = 'a';
	$.append($$anchor, fragment);
}