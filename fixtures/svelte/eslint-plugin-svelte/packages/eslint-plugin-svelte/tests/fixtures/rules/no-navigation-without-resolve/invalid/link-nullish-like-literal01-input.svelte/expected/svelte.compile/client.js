import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="undefined">Click me!</a> <a href="null">Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_nullish_like_literal01_input($$anchor) {
	const one = "undefined";
	const two = "null";
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 4);

	$.set_attribute(a, 'href', one);

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', two);

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', `undefined`);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', `null`);

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', `${undefined}`);

	var a_5 = $.sibling(a_4, 2);

	$.set_attribute(a_5, 'href', `${null}`);

	var a_6 = $.sibling(a_5, 2);

	$.set_attribute(a_6, 'href', `${one}`);

	var a_7 = $.sibling(a_6, 2);

	$.set_attribute(a_7, 'href', `${two}`);
	$.append($$anchor, fragment);
}