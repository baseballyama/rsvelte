import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as paths from '$app/paths';

var root = $.from_html(`<a>Click me!</a>; <a>Click me!</a>;`, 1);

export default function Link_base_namespace_import01_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);

	$.next();

	$.template_effect(() => {
		$.set_attribute(a, 'href', paths.base + '/foo/');
		$.set_attribute(a_1, 'href', `${paths.base}/foo/`);
	});

	$.append($$anchor, fragment);
	$.pop();
}