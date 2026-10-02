import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div aria-relevant=""></div> <div aria-relevant="foobar"></div> <div aria-relevant="true"></div> <div></div> <div></div> <div aria-relevant="additions removals_"></div> <div aria-relevant="additions removals_ "></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 6);

	$.set_attribute(div, 'aria-relevant', true);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'aria-relevant', "false");
	$.next(4);
	$.append($$anchor, fragment);
}