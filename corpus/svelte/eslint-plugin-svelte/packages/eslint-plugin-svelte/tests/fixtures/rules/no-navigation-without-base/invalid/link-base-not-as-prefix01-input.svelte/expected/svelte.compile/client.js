import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_base_not_as_prefix01_input($$anchor) {
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);

	$.template_effect(() => {
		$.set_attribute(a, 'href', '/foo/' + base);
		$.set_attribute(a_1, 'href', `/foo/${base}`);
	});

	$.append($$anchor, fragment);
}