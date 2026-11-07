import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div> <span>World!</span>`, 1);

export default function Class_directive01_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, '', null, {}, { first: true });

	var span = $.sibling(div, 2);

	$.set_class(span, 1, '', null, {}, { second: false });
	$.append($$anchor, fragment);
}