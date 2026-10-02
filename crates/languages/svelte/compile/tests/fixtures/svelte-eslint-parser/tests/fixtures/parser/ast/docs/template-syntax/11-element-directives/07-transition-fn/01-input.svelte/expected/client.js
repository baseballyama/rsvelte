import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div>`, 1);

export default function _1_input($$anchor) {
	const transition = (node, params) => ({
		delay: 42,
		duration: 42,
		easing: (t) => 42,
		css: (t, u) => 42,
		tick: (t, u) => {}
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);

	$.transition(3, div, () => fn);
	$.transition(3, div_1, () => fn, () => params);
	$.transition(3, div_2, () => fn);
	$.transition(3, div_3, () => fn, () => params);
	$.append($$anchor, fragment);
}