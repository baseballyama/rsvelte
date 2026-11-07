import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a>`);

export default function Link_resolved_pathname02_input($$anchor) {
	const href = '/test';
	var a = root();

	$.set_attribute(a, 'href', href);
	$.append($$anchor, a);
}