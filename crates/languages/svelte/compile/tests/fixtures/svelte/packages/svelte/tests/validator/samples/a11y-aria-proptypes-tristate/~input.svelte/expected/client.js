import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-checked="yes"></div> <div aria-checked="no"></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	const abc = 'abc';
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 4);

	$.set_attribute(div, 'aria-checked', 1234);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'aria-checked', `${abc}`);
	$.append($$anchor, fragment);
}