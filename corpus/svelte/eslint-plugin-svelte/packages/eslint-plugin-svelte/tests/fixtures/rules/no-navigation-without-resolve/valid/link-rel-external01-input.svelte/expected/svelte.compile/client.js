import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="whatever" rel="external">Click me!</a> <a rel="external">Click me!</a> <a rel="external">Click me!</a> <a rel="external">Click me!</a> <a href="whatever">Click me!</a> <a href="whatever">Click me!</a> <a href="whatever">Click me!</a> <a href="whatever" rel="noopener external noreferrer">Click me!</a>`, 1);

export default function Link_rel_external01_input($$anchor) {
	const value = 'whatever';
	const href = 'whatever';
	const external = 'external';
	const rel = 'external';
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);

	$.set_attribute(a, 'href', 'whatever');

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', value);

	var a_2 = $.sibling(a_1, 2);

	$.set_attribute(a_2, 'href', href);

	var a_3 = $.sibling(a_2, 2);

	$.set_attribute(a_3, 'rel', 'external');

	var a_4 = $.sibling(a_3, 2);

	$.set_attribute(a_4, 'rel', external);

	var a_5 = $.sibling(a_4, 2);

	$.set_attribute(a_5, 'rel', rel);
	$.next(2);
	$.append($$anchor, fragment);
}