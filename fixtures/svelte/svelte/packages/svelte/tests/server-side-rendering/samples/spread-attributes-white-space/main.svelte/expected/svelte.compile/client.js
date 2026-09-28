import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/>`, 1);

export default function Main($$anchor) {
	let props = { value: '\n\tbar\n' };
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ ...props }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ class: '\n	white\n	space\n', ...{} }), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, fragment);
}