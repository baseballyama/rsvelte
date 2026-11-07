import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_absolute_url_invalid_operator01_input($$anchor) {
	var fragment = root();
	var a = $.first_child(fragment);

	$.set_attribute(a, 'href', 'https://example.com' - '/foo');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', '/foo' - 'https://example.com');

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', 'https://' - 'example.com');
	$.append($$anchor, fragment);
}