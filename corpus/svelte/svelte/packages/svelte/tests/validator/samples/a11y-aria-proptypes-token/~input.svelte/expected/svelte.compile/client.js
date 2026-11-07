import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-sort=""></div> <div aria-sort="incorrect"></div> <div aria-sort="true"></div> <div></div> <div></div> <div aria-sort="ascending descending"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 6);

	$.set_attribute(div, 'aria-sort', true);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'aria-sort', "false");
	$.next(2);
	$.append($$anchor, fragment);
}