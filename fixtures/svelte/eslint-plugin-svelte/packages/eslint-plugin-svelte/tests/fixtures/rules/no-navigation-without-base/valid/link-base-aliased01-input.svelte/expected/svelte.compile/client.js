import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base as alias } from '$app/paths';

var root = $.from_html(`<a>Click me!</a>; <a>Click me!</a>;`, 1);

export default function Link_base_aliased01_input($$anchor) {
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);

	$.next();

	$.template_effect(() => {
		$.set_attribute(a, 'href', alias + '/foo/');
		$.set_attribute(a_1, 'href', `${alias}/foo/`);
	});

	$.append($$anchor, fragment);
}