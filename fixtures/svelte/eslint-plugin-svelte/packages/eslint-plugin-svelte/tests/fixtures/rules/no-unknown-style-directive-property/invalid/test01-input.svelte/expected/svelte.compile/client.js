import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div>`, 1);

export default function Test01_input($$anchor) {
	let red = 'red';
	let unknown = red;
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, '', {}, { 'unknown-color': red });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { unknown });
	$.append($$anchor, fragment);
}