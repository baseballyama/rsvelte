import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Ternary01_input($$anchor) {
	let red = 'red';
	var div = root();

	$.set_style(div, '\n    background-repeat: repeat;\n    background-color: red\n  ');
	$.append($$anchor, div);
}