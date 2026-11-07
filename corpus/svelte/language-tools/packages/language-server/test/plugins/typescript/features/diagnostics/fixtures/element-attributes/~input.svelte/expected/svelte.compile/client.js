import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div data-foo=""></div> <div></div> <div this-is="wrong"></div> <div></div>`, 1);

export default function Input($$anchor) {
	let bar = "bar";
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_attribute(div, 'data-bar', bar);

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, $.clsx(bar));

	var div_2 = $.sibling(div_1, 4);

	$.set_attribute(div_2, 'bar', bar);
	$.append($$anchor, fragment);
}