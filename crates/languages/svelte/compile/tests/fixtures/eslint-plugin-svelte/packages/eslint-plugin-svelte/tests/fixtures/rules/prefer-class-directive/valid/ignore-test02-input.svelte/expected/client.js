import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button>`);

export default function Ignore_test02_input($$anchor) {
	let a = true;
	let b = true;
	var button = root();

	$.set_class(button, 1, $.clsx(a ? 'a' : !b ? 'no-b' : 'b'));
	$.append($$anchor, button);
}