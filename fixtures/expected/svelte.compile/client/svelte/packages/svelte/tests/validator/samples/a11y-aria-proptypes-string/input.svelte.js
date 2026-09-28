import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-label="true"></div> <div></div> <div></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);

	$.set_attribute(div, 'aria-label', true);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'aria-label', false);

	var div_2 = $.sibling(div_1, 2);

	$.set_attribute(div_2, 'aria-label', 1234);

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'aria-label', !true);
	$.append($$anchor, fragment);
}