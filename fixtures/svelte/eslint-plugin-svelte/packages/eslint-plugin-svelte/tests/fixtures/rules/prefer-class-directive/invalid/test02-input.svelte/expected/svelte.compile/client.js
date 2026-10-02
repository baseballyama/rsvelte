import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button>`);

export default function Test02_input($$anchor) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;
	var button = root();

	$.set_class(button, 1, ' a c d');
	$.append($$anchor, button);
}