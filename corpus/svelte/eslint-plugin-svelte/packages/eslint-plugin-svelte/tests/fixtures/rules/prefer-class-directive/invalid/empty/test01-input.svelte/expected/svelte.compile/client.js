import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button> <button>foo</button> <div>foo</div> <div>foo</div>`, 1);

export default function Test01_input($$anchor) {
	let selected = 'foo';
	let children = 1;
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, $.clsx(selected ? 'selected' : ''));

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, 'a selected b');

	var button_2 = $.sibling(button_1, 2);

	$.set_class(button_2, 1, 'a selected b');

	var div = $.sibling(button_2, 2);

	$.set_class(div, 1, 'd-flex ');

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, 'd-flex ');
	$.append($$anchor, fragment);
}