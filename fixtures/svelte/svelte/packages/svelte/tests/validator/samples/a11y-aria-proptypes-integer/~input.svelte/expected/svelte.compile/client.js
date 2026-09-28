import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-level="yes"></div> <div aria-level="no"></div> <div></div> <div aria-level=""></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 4);

	$.set_attribute(div, 'aria-level', `abc`);

	var div_1 = $.sibling(div, 4);

	$.set_attribute(div_1, 'aria-level', "false");

	var div_2 = $.sibling(div_1, 2);

	$.set_attribute(div_2, 'aria-level', !"false");
	$.append($$anchor, fragment);
}