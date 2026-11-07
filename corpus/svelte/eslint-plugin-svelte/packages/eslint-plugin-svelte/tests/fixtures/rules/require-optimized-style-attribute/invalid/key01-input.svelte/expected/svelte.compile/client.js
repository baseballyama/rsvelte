import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Key01_input($$anchor) {
	let color = 'blue';
	let key = 'color';
	var div = root();

	$.set_style(div, 'font-size: 12px; color: blue;');
	$.append($$anchor, div);
}