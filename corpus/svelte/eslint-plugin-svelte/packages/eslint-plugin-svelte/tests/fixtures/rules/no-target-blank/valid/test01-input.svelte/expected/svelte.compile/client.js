import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>link</a> <a attr="">link</a> <a target="">link</a> <a href="https://svelte.dev/">link</a> <a>link</a> <a target="_blank" rel="noopener noreferrer">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">link</a> <a href="/foo" target="_blank">link</a> <a href="/foo" target="_blank" rel="noopener noreferrer">link</a> <a href="foo/bar" target="_blank">link</a> <a href="foo/bar" target="_blank" rel="noopener noreferrer">link</a>`, 1);

export default function Test01_input($$anchor) {
	let link = '';
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 8);

	$.set_attribute(a, 'href', link);

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', link);
	$.next(10);
	$.append($$anchor, fragment);
}