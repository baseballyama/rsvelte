import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_nullish01_input($$anchor) {
	const one = undefined;
	const two = null;
	const href = null;
	var fragment = root();
	var a = $.first_child(fragment);

	$.set_attribute(a, 'href', undefined);

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', null);

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', one);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', two);

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', href);
	$.append($$anchor, fragment);
}