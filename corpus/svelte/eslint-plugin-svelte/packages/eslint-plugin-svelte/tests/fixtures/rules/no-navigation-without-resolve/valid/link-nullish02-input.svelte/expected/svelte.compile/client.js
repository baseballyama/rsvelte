import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_nullish02_input($$anchor, $$props) {
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);

	$.template_effect(() => {
		$.set_attribute(a, 'href', $$props.one);
		$.set_attribute(a_1, 'href', $$props.two);
		$.set_attribute(a_2, 'href', $$props.href);
	});

	$.append($$anchor, fragment);
}