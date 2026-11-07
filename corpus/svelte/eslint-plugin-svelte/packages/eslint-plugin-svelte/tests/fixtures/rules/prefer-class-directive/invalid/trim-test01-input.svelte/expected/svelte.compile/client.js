import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button>`);

export default function Trim_test01_input($$anchor) {
	let current = 'foo';
	let active = true;
	var button = root();

	$.set_class(button, 1, 'active selected');
	$.append($$anchor, button);
}