import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div not-style="background: green">...</div> <div>...</div>`, 1);

export default function Test02_input($$anchor) {
	let red = 'red';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { 'background-repeat': 'repeat' });

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'not-style', 'background: red');
	$.set_style(div_1, '', {}, { 'background-repeat': 'repeat' });
	$.append($$anchor, fragment);
}