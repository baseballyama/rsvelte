import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="http://svelte.dev">Click me!</a> <a href="https://svelte.dev">Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a href="mailto:user@example.com">Click me!</a> <a href="tel:+123456789">Click me!</a>`, 1);

export default function Link_absolute_url01_input($$anchor) {
	const protocol = 'https';
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 4);

	$.set_attribute(a, 'href', 'http://svelte.dev');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', 'https://svelte.dev');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', 'http://svelte' + '.dev');

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'href', 'https://svelte' + '.dev');

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'href', 'http' + '://svelte.dev');

	var a_5 = $.sibling(a_4, 2);

	$.set_attribute(a_5, 'href', 'https' + '://svelte.dev');

	var a_6 = $.sibling(a_5, 2);

	$.set_attribute(a_6, 'href', `${protocol}://svelte.dev`);
	$.next(4);
	$.append($$anchor, fragment);
}