import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button> <button>foo</button>`, 1);

export default function Ignore_test01_input($$anchor) {
	let selected = 'foo';
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, 'selected-b');

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, 'a-selected');

	var button_2 = $.sibling(button_1, 2);

	$.set_class(button_2, 1, 'a selected b');
	$.append($$anchor, fragment);
}