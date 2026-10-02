import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);

	$.transition(1, div, () => fn);
	$.transition(1, div_1, () => fn, () => params);
	$.transition(1, div_2, () => fn);
	$.transition(1, div_3, () => fn, () => params);
	$.transition(2, div_4, () => fn);
	$.transition(2, div_5, () => fn, () => params);
	$.transition(2, div_6, () => fn);
	$.transition(2, div_7, () => fn, () => params);
	$.append($$anchor, fragment);
}