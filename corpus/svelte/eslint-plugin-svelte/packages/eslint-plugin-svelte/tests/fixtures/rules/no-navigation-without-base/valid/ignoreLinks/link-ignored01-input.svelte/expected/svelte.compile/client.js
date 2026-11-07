import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo">Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_ignored01_input($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);

	$.set_attribute(a, 'href', '/foo');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', '/' + 'foo');
	$.append($$anchor, fragment);
}