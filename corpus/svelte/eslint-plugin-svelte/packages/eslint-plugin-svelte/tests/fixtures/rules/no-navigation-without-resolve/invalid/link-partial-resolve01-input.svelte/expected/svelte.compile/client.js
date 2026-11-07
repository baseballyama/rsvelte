import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_partial_resolve01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = resolve('/foo') + '/bar';
	const href = resolve('/foo') + '/bar';
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
			$.set_attribute(a_2, 'href', value);
			$.set_attribute(a_3, 'href', href);
		},
		[
			() => resolve('/foo') + '/bar',
			() => '/foo' + resolve('/bar')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}