import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_base_prefixed01_input($$anchor) {
	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);

	$.template_effect(() => {
		$.set_attribute(a, 'href', base + '/foo/');
		$.set_attribute(a_1, 'href', `${base}/foo/`);
		$.set_attribute(a_2, 'href', value1);
		$.set_attribute(a_3, 'href', value2);
	});

	$.append($$anchor, fragment);
}