import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Test02_input($$anchor) {
	let red = 'red';
	var div = root();

	$.set_attribute(div, 'not-style', 'background: red');
	$.set_style(div, '', {}, { background: 'green' });
	$.append($$anchor, div);
}