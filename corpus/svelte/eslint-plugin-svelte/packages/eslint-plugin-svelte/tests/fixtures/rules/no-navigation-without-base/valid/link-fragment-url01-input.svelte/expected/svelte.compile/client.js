import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="#">Click me!</a> <a href="#section">Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_fragment_url01_input($$anchor) {
	const section = 'sectionName';
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 4);

	$.set_attribute(a, 'href', '#section');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', '#' + 'section');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', '#' + section);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', `#${section}`);

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', '#user:42');
	$.append($$anchor, fragment);
}