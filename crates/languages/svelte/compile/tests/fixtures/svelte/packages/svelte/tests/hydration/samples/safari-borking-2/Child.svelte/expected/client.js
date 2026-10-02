import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<hr/> `, 1);

export default function Child($$anchor) {
	const message = `call +636-555-3226 now`;
	var fragment = root();
	var text = $.sibling($.first_child(fragment));

	text.nodeValue = ' call +636-555-3226 now';
	$.append($$anchor, fragment);
}