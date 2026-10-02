import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-valuemax="yes"></div> <div aria-valuemax="no"></div> <div></div> <div></div> <div aria-valuemax="true"></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 4);

	$.set_attribute(div, 'aria-valuemax', `abc`);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'aria-valuemax', true);

	var div_2 = $.sibling(div_1, 4);

	$.set_attribute(div_2, 'aria-valuemax', 'false');

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'aria-valuemax', !'false');
	$.append($$anchor, fragment);
}