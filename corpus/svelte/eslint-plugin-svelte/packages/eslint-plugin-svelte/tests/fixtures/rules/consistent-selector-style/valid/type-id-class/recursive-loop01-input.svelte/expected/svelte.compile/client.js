import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a>`);

export default function Recursive_loop01_input($$anchor) {
	const a = derived;
	const derived = a;
	var a_1 = root();

	$.set_attribute(a_1, 'id', derived);
	$.append($$anchor, a_1);
}