import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);

	$.transition(3, div, () => fade);
	$.transition(1, div_1, () => fade);
	$.transition(2, div_2, () => fade);
	$.append($$anchor, fragment);
}