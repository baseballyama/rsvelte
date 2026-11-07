import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a>`);

export default function Recursive_loop01_input($$anchor) {
	const a = value;
	const value = a;
	var a_1 = root();

	$.set_attribute(a_1, 'href', value);
	$.append($$anchor, a_1);
}