import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button> <button>foo</button> <button>foo</button>`, 1);

export default function Ignore_test05_input($$anchor) {
	let a = true;
	let a7 = 7;
	let danger = false;
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, $.clsx(a ? 'a' : 'b'));

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, $.clsx(!a ? 'b' : 'a'));

	var button_2 = $.sibling(button_1, 2);

	$.set_class(button_2, 1, $.clsx(a7 === 7 ? 'a' : 'b'));

	var button_3 = $.sibling(button_2, 2);

	$.set_class(button_3, 1, 'btn btn-primary');
	$.append($$anchor, fragment);
}