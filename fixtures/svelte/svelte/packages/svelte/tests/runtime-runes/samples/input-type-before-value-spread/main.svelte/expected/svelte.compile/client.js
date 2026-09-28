import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/>`, 1);

export default function Main($$anchor) {
	const value = 'line1\nline2\nline3';
	const spread = { name: 'field', value };
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ ...spread, type: 'hidden' }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ type: 'hidden', ...spread }), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, fragment);
}