import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <button>CLICK ME!</button>`, 1);

export default function Test01_input($$anchor) {
	let text = 'abc';
	const maxlength = 42;
	const attrs = { disabled: true };

	function click() {}

	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ type: 'text', maxlength, ...attrs, readonly: true }), void 0, void 0, void 0, void 0, true);

	var button = $.sibling(input, 2);

	$.attribute_effect(button, () => ({ type: 'button', maxlength, ...attrs }));
	$.bind_value(input, () => text, ($$value) => text = $$value);
	$.event('click', button, click);
	$.append($$anchor, fragment);
}