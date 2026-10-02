import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div>`, 1);

export default function Invalid_style01_input($$anchor) {
	let style = "color: red";
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_style(div, style);

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, style);
	$.append($$anchor, fragment);
}