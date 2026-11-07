import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ ...{ readonly: 1 } }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ ...{ readonly: 0 } }), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, fragment);
}