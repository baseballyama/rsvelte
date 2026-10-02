import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button>`, 1);

export default function Ignore_test03_input($$anchor) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, $.clsx(a && b && c ? 'a b c' : ' '));

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, $.clsx(d ? '??' : ' '));
	$.append($$anchor, fragment);
}