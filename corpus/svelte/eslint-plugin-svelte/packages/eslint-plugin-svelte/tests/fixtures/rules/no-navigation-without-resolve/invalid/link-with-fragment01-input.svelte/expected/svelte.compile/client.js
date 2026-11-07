import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo#section">Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_with_fragment01_input($$anchor) {
	const value = "/foo#section";
	const href = "/foo#section";
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);

	$.set_attribute(a, 'href', '/foo#section');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', '/' + 'foo#section');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', value);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', href);

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', '/foo#section:42');
	$.append($$anchor, fragment);
}