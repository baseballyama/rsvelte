import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <input type="text" disabled=""/>`, 1);

export default function Link_resolved01_input($$anchor, $$props) {
	$.push($$props, true);

	const value = resolve('/foo/');
	const href = resolve('/foo/');
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);

	$.next(2);

	$.template_effect(
		($0) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', value);
			$.set_attribute(a_2, 'href', href);
		},
		[() => resolve('/foo/')]
	);

	$.append($$anchor, fragment);
	$.pop();
}