import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div>`, 1);

export default function Quote_test02_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_attribute(div, 'data-text', '\'"');

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'data-text', "'\"");

	var div_2 = $.sibling(div_1, 2);

	$.set_attribute(div_2, 'data-text', '\'"');

	var div_3 = $.sibling(div_2, 2);

	$.set_attribute(div_3, 'data-text', "'\"");
	$.append($$anchor, fragment);
}