import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://svelte.dev/" target="_blank">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopenernoreferrer">link</a> <a target="_blank" rel="3">link</a> <a target="_blank">link</a> <a href="https://svelte.dev/" target="_blank" rel="noopener">link</a>`, 1);

export default function Test01_input($$anchor) {
	let link = '';
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 4);

	$.set_attribute(a, 'href', link);

	var a_1 = $.sibling(a, 2);

	$.set_attribute(a_1, 'href', link);
	$.next(2);
	$.append($$anchor, fragment);
}