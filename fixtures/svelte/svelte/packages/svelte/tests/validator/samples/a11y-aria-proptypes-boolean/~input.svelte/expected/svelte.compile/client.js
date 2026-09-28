import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button aria-disabled="yes">click me</button> <button aria-disabled="no">click me</button> <button>click me</button> <button>click me</button>`, 1);

export default function Input($$anchor) {
	const abc = 'abc';
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 4);

	$.set_attribute(button, 'aria-disabled', 1234);

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'aria-disabled', `${abc}`);
	$.append($$anchor, fragment);
}