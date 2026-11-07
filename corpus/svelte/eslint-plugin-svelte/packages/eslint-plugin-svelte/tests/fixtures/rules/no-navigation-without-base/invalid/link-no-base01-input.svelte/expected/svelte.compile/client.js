import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo">Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_no_base01_input($$anchor) {
	const value = "/foo";
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);

	$.set_attribute(a, 'href', '/foo');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', '/' + 'foo');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', value);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', '/user:42');
	$.append($$anchor, fragment);
}